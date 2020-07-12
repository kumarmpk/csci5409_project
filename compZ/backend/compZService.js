const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mySql = require("mysql");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

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

port = process.env.Port || 4000;
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

//fetching all the jobs present
app.get("/api/jobs", (_req, res) => {
  let sqlQuery = "Select * from jobs";
  db.query(sqlQuery, (err, allJobs) => {
    if (err) {
      return res
        .status(404)
        .send("error occurred while fetching jobs in the database");
    }
    if (Object.keys(allJobs).length === 0) {
      return res.status(404).send("No jobs present in the database");
    }
    res.send(JSON.stringify(allJobs, undefined, 4));
  });
});

//fetching a specific job details based on the value entered in the textbox
app.get("/api/jobs/:jobName/", (req, res) => {
  let insertQuery = "Insert into Search values(?,?,?)";
  var callback = (jobToFetch, error) => {
    if (error) {
      res
        .status(404)
        .send("error occurred while fetching job from the database");
    }
    if (Object.keys(jobToFetch).length === 0) {
      return res
        .status(404)
        .send("job not found, please enter another job name");
    }
    values = [
      req.params.jobName.trim().toLowerCase(),
      new Date(),
      new Date().toLocaleTimeString(),
    ];
    db.query(insertQuery, values, (err, records) => {
      if (err) {
        res
          .status(404)
          .send("error occurred while inserting record in the database");
      }
    });
    res.send(JSON.stringify(jobToFetch, undefined, 4));
  };
  checkIfJobExists(req.params.jobName, callback);
});

//Fetching all the parts details for a job
app.get("/api/parts/:jobName/", (req, res) => {
  if (req.params.jobName) {
    let sqlQuery =
      "select * from jobs j inner join parts p  on j.partId = p.partId where j.jobName=?";
    values = [req.params.jobName.trim().toLowerCase()];
    db.query(sqlQuery, values, (err, allJobs) => {
      if (err) {
        console.log(err);
        return res
          .status(404)
          .send("error occurred while fetching jobs in the database");
      }
      if (Object.keys(allJobs).length === 0) {
        return res.status(404).send("No jobs present in the database");
      }
      res.send(JSON.stringify(allJobs, undefined, 4));
    });
  } else {
    res.status(404).send("something wrong with the input");
  }
});

//Fetching all the parts details for a job with jobName and partId
app.get("/api/parts/:jobName/:partId/", (req, res) => {
  if (req.params.jobName && req.params.partId) {
    let sqlQuery =
      "select * from jobs j inner join parts p  on j.partId = p.partId where j.jobName=? and j.partId=?";
    values = [req.params.jobName.trim().toLowerCase(), req.params.partId];
    db.query(sqlQuery, values, (err, partDetails) => {
      if (err) {
        console.log(err);
        return res
          .status(404)
          .send("error occurred while fetching jobs in the database");
      }
      if (Object.keys(partDetails).length === 0) {
        return res.status(404).send("No jobs or parts present in the database");
      }
      res.send(JSON.stringify(partDetails, undefined, 4));
    });
  } else {
    res.status(404).send("something wrong with the input");
  }
});

//authenticating the user
process.env.SECRETKEY = "secret";
app.get("/api/users/:username/", (req, res) => {
  if (req.params.username && req.body.password) {
    let sqlQuery = "select * from Users where email=? and password=?";
    let values = [req.params.username, req.body.password];
    db.query(sqlQuery, values, (err, results) => {
      if (err) {
        return res.status(404).send("credentials are wrong");
      }
      if (Object.keys(results).length > 0) {
        let token = jwt.sign(
          req.params.username.trim().toLowerCase(),
          process.env.SECRETKEY
        );
        return res.status(200).send(token);
      } else {
        return res.status(404).send(`credentials are wrong`);
      }
    });
  } else {
    res.status.send(`credentials are wrong`);
  }
});

//method to insert the order and  in JobParts table
app.post("/api/updateOrder", (req, res) => {
  let selectQuery =
    "select * from JobParts where jobName=? and userId=? and partId in (?)";
  let insertQuery = "Insert into JobParts values(?,?,?,?,?,?,?)";
  // let updatePartsQuery =
  //   "update parts set qoh = case when qoh-? >=0 Then qoh-? else qoh end where partId = ?";
  if (req.body) {
    let selectValues = [req.body.jobName, req.body.userId, req.body.partId];
    db.query(selectQuery, selectValues, (err, selectedResults) => {
      console.log(selectedResults);
      if (Object.keys(selectedResults).length === 0) {
        req.body.partId.forEach((partId) => {
          values = [
            partId,
            req.body.jobName,
            req.body.userId,
            req.body.qty,
            new Date(),
            new Date().toLocaleTimeString(),
            req.body.result,
          ];
          db.query(insertQuery, values, (err, results) => {
            if (err) {
              return res.status(404).send(err);
            }
            res.send("Jobparts inserted successfully");
          });
        });
      } else {
        res
          .status(500)
          .send(
            "user has ordered already for parts" +
              JSON.stringify(selectedResults, undefined, 4)
          );
      }
    });
  }
});

//searching all the jobs present
app.get("/api/searchhistory", (_req, res) => {
  let sqlQuery = "Select * from Search order by time desc limit 10";
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
  res.send("Invalid url, please enter valid url path");
});

function checkIfJobExists(jobName, callback) {
  if (jobName) {
    let query =
      "select * from jobs where jobName like '%" +
      jobName.trim().toLowerCase() +
      "%'";

    db.query(query, (err, results) => {
      if (err) {
        callback("error occured while checking for data in the database");
      }
      callback(results, err);
    });
  } else {
    callback("invalid JobName");
  }
}
