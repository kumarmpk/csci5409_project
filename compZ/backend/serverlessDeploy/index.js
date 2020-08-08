const express = require("express");
const functions = require('firebase-functions')
const bodyParser = require("body-parser");
const app = express();
const mySql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const randomString = require("@supercharge/strings");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
const axios = require("axios");


var db = mySql.createConnection({
  host: "groupassignmentsdb.cibsusss4zqs.us-east-1.rds.amazonaws.com",
  user: "team_db",
  password: "4A98d8Gx",
  port: "3306",
  database: "companies",
});

db.connect((err) => {
  if (err) {
    return console.log(err);
  }
  console.log("MySql Connected");
});

port = 4000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

app.get("/", (_req, res) => {
  try {
    res.send("Job Application started");
  } catch (error) {
    return res.status(404).send("error occçurred during initial setup");
  }
});

//maintain history for every search
app.post("/api/jobs/:jobName/", (req, res) => {
  let insertQuery = "Insert into Search values(?,?,?)";
  if (req.params.jobName) {
    values = [
      req.params.jobName.trim().toLowerCase(),
      new Date(),
      new Date().toLocaleTimeString(),
    ];
    db.query(insertQuery, values, (err, results) => {
      if (err) {
        res
          .status(404)
          .send("error occurred while inserting record in the database");
      }
      res.status(200).send("search record inserted successfully");
    });
  }
});

//authenticating the user
process.env.SECRETKEY = "secret";
app.post("/api/users", (req, res) => {
  if (req.body.username && req.body.password) {
    let sqlQuery = "select * from Users where email=? and password=?";
    let values = [req.body.username, req.body.password];
    db.query(sqlQuery, values, (err, results) => {
      if (err) {
        return res.status(404).send("credentials are wrong");
      }
      if (Object.keys(results).length > 0) {
        let token = jwt.sign(
          req.body.username.trim().toLowerCase(),
          process.env.SECRETKEY
        );
        return res.status(200).send(token);
      } else {
        return res.status(404).send(`credentials are wrong`);
      }
    });
  } else {
    res.status(404).send(`credentials are wrong`);
  }
});

app.post("/api/getOrder", (req, res) => {
  if (req.body) {
    let array = req.body;
    let partIdList = [];
    let jobName = req.body[0].jobName;
    let userId = req.body[0].userId;
    for (let obj of array) {
      partIdList.push(obj.partId);
    }
    let selectQuery = `select * from JobParts where jobName='${jobName}' and userId='${userId}' and partId in (${partIdList})`;
    db.query(selectQuery, (err, selectedResults) => {
      if (err) {
        res.status(404).send("something went wrong with the database");
      }

      res.status(200).send(selectedResults);
    });
  } else {
    res.status(500).send("invalid request");
  }
});

//method to insert the order and in JobParts table
app.post("/api/updateOrder", (req, res) => {
  let insertQuery = "Insert into JobParts values(?,?,?,?,?,?,?)";
  if (req.body) {
    let array = req.body;
    let obj = "";
    let partIdList = [];
    let jobName = req.body[0].jobName;
    let userId = req.body[0].userId;
    for (obj of array) {
      partIdList.push(obj.partId);
    }
    let selectQuery = `select * from JobParts where jobName='${jobName}' and userId='${userId}' and partId in (${partIdList})`;
    db.query(selectQuery, (err, selectedResults) => {
      if (!selectedResults || Object.keys(selectedResults).length === 0) {
        if (err) {
          res.status(404).send("something went wrong with the database");
        }
        array.forEach((reqObj) => {
          values = [
            reqObj.partId,
            reqObj.jobName,
            reqObj.userId,
            reqObj.qty,
            new Date(),
            new Date().toLocaleTimeString(),
            reqObj.result,
          ];
          db.query(insertQuery, values, (err, results) => {
            if (err) {
              return res
                .status(404)
                .send("something went wrong with the database");
            }
          });
        });
        res.send("Jobparts inserted successfully");
      } else {
        orderedPartIds = [];
        selectedResults.forEach((element) => {
          orderedPartIds.push(element.partId);
        });
        res
          .status(500)
          .send(
            " user has already ordered  parts " +
              orderedPartIds +
              " for Job " +
              selectedResults[0].jobName
          );
      }
    });
  }
});

function endTransaction(transactionName, endRes) {
  let trans_end = `XA end '${transactionName}' ;`;

  db.query(trans_end, (trans_end_err, trans_end_res) => {
    if (trans_end_err) {
      console.log("trans_end_err", trans_end_err);
    } else {
      endRes("success");
    }
  });
}

function rollbackTransaction(transactionName) {
  let trans_roll_query = `XA rollback '${transactionName}' ;`;

  db.query(trans_roll_query, (trans_roll_err, trans_roll_res) => {
    if (trans_roll_err) {
      console.log("trans_roll_err", trans_roll_err);
    } else {
      console.log("trans_roll_res", trans_roll_res);
      console.log("success");
    }
  });
}

function commitTransaction(transactionName, commRes) {
  let trans_comm_query = `XA commit '${transactionName}' ;`;

  db.query(trans_comm_query, (trans_comm_err, trans_comm_res) => {
    if (trans_comm_err) {
      console.log("trans_comm_err", trans_comm_err);
    } else {
      commRes("success");
    }
  });
}

function startTransaction(transactionName, startRes) {
  let trans_start_query = `XA start '${transactionName}' ;`;

  db.query(trans_start_query, (trans_start_err, trans_strat_res) => {
    if (trans_start_err) {
      console.log("trans_start_err", trans_start_err);
    } else {
      startRes("success");
    }
  });
}

function prepareTransaction(transactionName, prepRes) {
  let trans_prep_query = `XA prepare '${transactionName}' ;`;

  db.query(trans_prep_query, (trans_prep_err, trans_prep_res) => {
    if (trans_prep_err) {
      console.log("trans_prep_err", trans_prep_err);
    } else {
      prepRes("success");
    }
  });
}

//To commit request for CompZ
function PreparerequestDetailsforZ(request, result) {
  let insertQuery = "Insert into JobParts values(?,?,?,?,?,?,?)";
  if (request) {
    let array = request;
    let obj = "";
    let partIdList = [];
    let jobName = request[0].jobName;
    let userId = request[0].userId;
    for (obj of array) {
      partIdList.push(obj.partId);
    }
    let selectQuery = `select * from JobParts where jobName='${jobName}' and userId='${userId}' and partId in (${partIdList})`;
    db.query(selectQuery, (select_err, selectedResults) => {
      if (!selectedResults || Object.keys(selectedResults).length === 0) {
        if (select_err) {
          result("something went wrong with the database");
        }
        array.forEach((reqObj) => {
          values = [
            reqObj.partId,
            reqObj.jobName,
            reqObj.userId,
            reqObj.qty,
            new Date(),
            new Date().toLocaleTimeString(),
            reqObj.result,
          ];
          db.query(insertQuery, values, (insert_err, results) => {
            if (insert_err) {
              result("something went wrong in the database");
            }
          });
        });
        result("success");
      } else {
        orderedPartIds = [];
        selectedResults.forEach((element) => {
          orderedPartIds.push(element.partId);
        });
        result(
          " user has already ordered  parts " +
            orderedPartIds +
            " for Job " +
            selectedResults[0].jobName
        );
      }
    });
  }
}

//API created for 2 phase commit
app.post("/api/updateOrderusing2pc", (req, res) => {
  if (req.body) {
    let request = req.body;
    let currentstate = "";
    let transactionName = randomString.random(5);
    let transactionNameX;
    let transactionNameY;
    console.log("1", currentstate);
    startTransaction(transactionName, (startRes) => {
      console.log("2", currentstate);
      if (startRes === "success") {
        currentstate = "transasction started";
        console.log("3", currentstate);
        transactionNameX = transactionName + "_X";
        PreparerequestDetailsforX(request, transactionNameX, (resultX) => {
          console.log("4", currentstate, resultX);
          if (resultX == "success") {
            currentstate = "request sent for preparing X";
            console.log("5", currentstate);
            transactionNameY = transactionName + "_Y";
            PreparerequestDetailsforY(request, transactionNameY, (resultY) => {
              currentstate = "request sent for preparing Y";
              console.log("6", currentstate);
              if (resultY == "success") {
                currentstate = "request sent for preparing Z";
                console.log("7", currentstate);
                PreparerequestDetailsforZ(request, (results) => {
                  console.log("8", currentstate);
                  endTransaction(transactionName, (endRes) => {
                    console.log("9", endRes);
                    if (endRes == "success") {
                      prepareTransaction(transactionName, (prepRes) => {
                        console.log("10", prepRes);
                        if (prepRes == "success") {
                          let operationType = "commit";
                          sendCommitToX(
                            transactionNameX,
                            operationType,
                            (commitResultX) => {
                              currentstate = "commit request sent to  X";
                              console.log("11", currentstate, commitResultX);
                              if (commitResultX == "success") {
                                sendCommitToY(
                                  transactionNameY,
                                  operationType,
                                  (commitResultY) => {
                                    currentstate = "commit request sent to  Y";
                                    console.log(
                                      "12",
                                      currentstate,
                                      commitResultY
                                    );
                                    if (commitResultY == "success") {
                                      commitTransaction(
                                        transactionName,
                                        (commitRes) => {
                                          currentstate = "commit started in Z";
                                          console.log("13", currentstate);
                                          if (commitRes == "success") {
                                            res.send(
                                              `commit successful and state is ${currentstate}`
                                            );
                                          } else {
                                            let resZ;
                                            let resY;
                                            let operationType = "rollback";
                                            sendRollbackRequestToX(
                                              transactionNameX,
                                              operationType
                                            );
                                            sendRollbackRequestToY(
                                              transactionNameY,
                                              operationType
                                            );
                                            rollbackTransaction(
                                              transactionName
                                            );
                                            res.send("rollback successful");
                                          }
                                        }
                                      );
                                    } else {
                                      let resZ;
                                      let resY;
                                      let operationType = "rollback";
                                      sendRollbackRequestToX(
                                        transactionNameX,
                                        operationType
                                      );
                                      sendRollbackRequestToY(
                                        transactionNameY,
                                        operationType
                                      );
                                      rollbackTransaction(transactionName);
                                      res.send("rollback successful");
                                    }
                                  }
                                );
                              } else {
                                let resZ;
                                let resY;
                                let operationType = "rollback";
                                sendRollbackRequestToX(
                                  transactionNameX,
                                  operationType
                                );
                                sendRollbackRequestToY(
                                  transactionNameY,
                                  operationType
                                );
                                rollbackTransaction(transactionName);
                                res.send("rollback successful");
                              }
                            }
                          );
                        } else {
                          let resZ;
                          let resY;
                          let operationType = "rollback";
                          sendRollbackRequestToX(
                            transactionNameX,
                            operationType
                          );
                          sendRollbackRequestToY(
                            transactionNameY,
                            operationType
                          );
                          rollbackTransaction(transactionName);
                          res.send("rollback successful");
                        }
                      });
                    } else {
                      let resZ;
                      let resY;
                      let operationType = "rollback";
                      sendRollbackRequestToX(transactionNameX, operationType);
                      sendRollbackRequestToY(transactionNameY, operationType);
                      rollbackTransaction(transactionName);
                      res.send("rollback successful");
                    }
                  });
                });
              } else {
                let resZ;
                let resY;
                let operationType = "rollback";
                sendRollbackRequestToX(transactionNameX, operationType);
                sendRollbackRequestToY(transactionNameY, operationType);
                rollbackTransaction(transactionName);
                console.log("failed at yyyyyyyyyyyyyyyyy");
                res.send("rollback successful");
              }
            });
          } else {
            let resZ;
            let resY;
            let operationType = "rollback";
            sendRollbackRequestToX(transactionNameX, operationType);
            sendRollbackRequestToY(transactionNameY, operationType);
            rollbackTransaction(transactionName);
            console.log("failed at XXXXXXXXXXXXXX");
            res.send("rollback successful");
          }
        });
      }
    });
  } else {
    return res.status(500).send("something wrong with the transaction");
  }
});

app.get("/rollback", async (req, res) => {
  try {
    let transactionName = req.query.transName;
    let operationType = "rollback";
    let resZ;
    sendRollbackRequestToX(transactionName, operationType, (resX) => {
      console.log("resX", resX);
    });

    sendRollbackRequestToY(transactionName, operationType);
    rollbackTransaction(transactionName);
    res.send("rollback successful");
  } catch (e) {
    console.log("exception", e);
  }
});

//To send prepare request for X
function PreparerequestDetailsforX(request, transactionName, resultX) {
  let orderList = [];
  result = {};
  for (var obj of request) {
    orderDetailForX = obj;
    orderList.push({
      jobName: obj.jobName,
      partId: obj.partId,
      userId: obj.userId,
      qty: obj.qty,
    });
  }

  requestDetailsForX = {
    order: orderList,
    transactionName: transactionName,
  };

  axios
    .post(
      "https://enigmatic-everglades-12100.herokuapp.com/api/orders",
      requestDetailsForX
    )
    .then((res) => {
      console.log("PreparerequestDetailsforX res", res.data);
      if (res.data.isPrepared == true) {
        resultX("success");
      } else {
        resultX(res.data.message);
      }
    })
    .catch((err) => console.log("PreparerequestDetailsforX err", err));
}

//To send prepare request for Comp Y
function PreparerequestDetailsforY(request, transactionName, resultY) {
  let orderList = [];
  for (var obj of request) {
    orderDetailForX = obj;
    orderList.push({
      jobName: obj.jobName,
      partId: obj.partId,
      userId: obj.userId,
      qty: obj.qty,
    });
  }

  requestDetailsForY = {
    order: orderList,
    transactionName: transactionName,
  };
  axios
    .post(
      "https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/orders",
      requestDetailsForY
    )
    .then((res) => {
      console.log("PreparerequestDetailsforY res", res.data);
      if (res.data.isPrepared == true) {
        resultY("success");
      } else {
        resultY(res.data.message);
      }
    })
    .catch((err) => console.log("PreparerequestDetailsforY err", err));
}

//To send commit request to X
function sendCommitToX(transactionName, operationType, commitResultX) {
  requestDetailsForX = {
    transactionName: transactionName,
    operationType: operationType,
  };
  axios
    .post(
      "https://enigmatic-everglades-12100.herokuapp.com/api/orders/finish",
      requestDetailsForX
    )
    .then((res) => {
      if (res.data.operationSuccessful) {
        commitResultX("success");
      } else {
        commitResultX(res.data.message);
      }
    })
    .catch((err) => console.log("sendCommitToX", err.response.data));
}

//To send commit request to Y
function sendCommitToY(transactionName, operationType, commitResultY) {
  requestDetailsForY = {
    transactionName: transactionName,
    operationType: operationType,
  };
  axios
    .post(
      "https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/orders/finish",
      requestDetailsForY
    )
    .then((res) => {
      if (res.data.operationSuccessful) {
        commitResultY("success");
      } else {
        commitResultY(res.data.message);
      }
    })
    .catch((err) => console.log(err.response.data));
}

//TO Send rollback request to X
function sendRollbackRequestToX(
  transactionName,
  operationType,
  rollbackResponseX
) {
  requestDetailsForX = {
    transactionName: transactionName,
    operationType: operationType,
  };
  axios
    .post(
      "https://enigmatic-everglades-12100.herokuapp.com/api/orders/finish",
      requestDetailsForX
    )
    .then((res) => {
      console.log("XXX", res.data);
      if (res.operationSuccessful) {
        rollbackResponseX(res.data.message);
      } else {
        rollbackResponseX(res.data.message);
      }
    })
    .catch((err) => console.log("err XXXX", err.response));
}

//To send rollback request to Y
function sendRollbackRequestToY(transactionName, operationType) {
  console.log("1");

  let requestDetailsForY = {
    transactionName: transactionName,
    operationType: operationType,
  };

  axios
    .post(
      "https://us-central1-testproject-277421.cloudfunctions.net/cloudproject_compY/orders/finish",
      requestDetailsForY
    )
    .then((res) => {
      console.log("YYY", res.data);
      if (res.operationSuccessful) {
        console.log(res.data.message);
      } else {
        console.log(res.data.message);
      }
    })
    .catch((err) => console.log("err YYYY", err));
}

app.get("/api/getOrderedJobs", (req, res) => {
  let userId = req.query.userId;
  if (!userId) {
    return res.status(500).send("UserId is Invalid");
  } else {
    let sqlQuery = `Select * from JobParts where userId = '${userId}';`;
    db.query(sqlQuery, (err, jobparts) => {
      if (err) {
        return res
          .status(500)
          .send("error occured while fetching jobs in the database");
      }
      if (Object.keys(jobparts).length === 0) {
        return res.status(404).send("No orders present in the database");
      }
      res.send(JSON.stringify(jobparts, undefined, 4));
    });
  }
});

//searching all the jobs present
app.get("/api/searchhistory", (_req, res) => {
  let sqlQuery = "Select * from Search order by date desc, time desc limit 10";
  db.query(sqlQuery, (err, allSearchHistory) => {
    if (err) {
      return res
        .status(404)
        .send("error occurred while fetching jobs in the database");
    }
    if (Object.keys(allSearchHistory).length === 0) {
      return res.status(404).send("No jobs present in the database");
    }
    res.send(JSON.stringify(allSearchHistory, undefined, 4));
  });
});

//Invalid url handling
app.get("*", (_req, res) => {
  res.status(404).send("Invalid url, please enter valid url path");
});

exports.companyz=  functions.https.onRequest(app);