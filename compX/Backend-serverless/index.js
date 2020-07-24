const mysql = require("mysql");

var db = mysql.createPool({
  host: "groupassignmentsdb.cibsusss4zqs.us-east-1.rds.amazonaws.com",
  user: "team_db",
  port: "3306",
  password: "4A98d8Gx",
  database: "companies",
});

exports.handler = (event, context, callback) => {
  let sql_err = {
    statusCode: 400,
    body: "",
  };
  let invalid_request = "The request is invalid.";

  let http_method = event["context"]["http-method"];
  let resource_path = event["context"]["resource-path"];

  if (http_method === "GET") {
    if (resource_path === "/") {
      let jobName = event["params"]["querystring"]["jobName"];
      let partId = event["params"]["querystring"]["partId"];

      if ((!jobName || jobName === "") && (!partId || partId === "")) {
        context.callbackWaitsForEmptyEventLoop = false;
        let selectAllJobsQuery = "select * from jobs";
        db.getConnection(function (err, connection) {
          connection.query(selectAllJobsQuery, function (
            error,
            results,
            fields
          ) {
            connection.release();
            if (error) {
              sql_err.body = error;
              callback(sql_err);
            } else callback(null, results);
          });
        });
      } else if (jobName && jobName !== "" && (!partId || partId === "")) {
        let selectJobByName = `select * from jobs where lower(jobName) like '%${jobName.toLowerCase()}%';`;

        context.callbackWaitsForEmptyEventLoop = false;
        db.getConnection(function (err, connection) {
          connection.query(selectJobByName, function (error, results, fields) {
            connection.release();
            if (error) {
              sql_err.body = error;
              callback(sql_err);
            } else callback(null, results);
          });
        });
      } else if (jobName && jobName !== "" && partId && partId !== "") {
        let selectById = `select * from jobs where jobName = '${jobName}' and partId = '${partId}';`;

        context.callbackWaitsForEmptyEventLoop = false;
        db.getConnection(function (err, connection) {
          connection.query(selectById, function (err, res, fields) {
            connection.release();
            if (err) {
              sql_err.body = err;
              callback(sql_err);
            } else callback(null, res);
          });
        });
      } else {
        callback(invalid_request);
      }
    } else if (resource_path === "/order") {
      context.callbackWaitsForEmptyEventLoop = false;
      let selectOrders = "select * from partordersX";
      db.getConnection(function (err, connection) {
        connection.query(selectOrders, function (error, result, fields) {
          connection.release();
          if (err) {
            sql_err.body = error;
            callback(sql_err);
          } else callback(null, result);
        });
      });
    } else {
      callback(invalid_request);
    }
  } else if (http_method === "POST") {
    let jobName = event["body-json"]["jobName"];
    let partId = event["body-json"]["partId"];
    let qty = event["body-json"]["qty"];
    let userId = event["body-json"]["userId"];

    console.log("inside post");

    if (resource_path === "/") {
      console.log("inside userId empty");
      let selectQuery = `select * from jobs where jobName = '${jobName}' and partId = '${partId}';`;

      context.callbackWaitsForEmptyEventLoop = false;
      db.getConnection(function (err, connection) {
        connection.query(selectQuery, function (
          select_error,
          select_results,
          select_fields
        ) {
          if (select_error) callback(select_error);
          else if (select_results.length == 0) {
            let insertQuery = "insert into jobs SET ?";
            let insertData = {
              jobName: jobName,
              partId: partId,
              qty: qty,
            };
            connection.query(insertQuery, insertData, function (
              insert_error,
              insert_results,
              insert_fields
            ) {
              connection.release();
              if (insert_error) callback(insert_error);
              console.log("insert_results", insert_results);
              callback(null, "1");
            });
          } else {
            callback("2");
          }
        });
      });
    } else if (resource_path === "/order") {
      console.log("inside userId not empty");
      let selectQuery = `select * from partordersX where jobName = '${jobName}' and partId = '${partId}' and userId = '${userId}';`;
      context.callbackWaitsForEmptyEventLoop = false;
      db.getConnection(function (err, connection) {
        connection.query(selectQuery, function (
          select_err,
          select_res,
          select_fields
        ) {
          console.log("select query");
          console.log("select_res", select_res);
          if (select_err) {
            console.log("select select_err");
            sql_err.body = select_err;
            callback(sql_err);
          } else if (select_res.length == 0) {
            console.log("select_res inside if");
            let insertQuery = "insert into partordersX SET ?";
            let insertData = {
              jobName: jobName,
              partId: partId,
              qty: qty,
              userId: userId,
            };
            connection.query(insertQuery, insertData, function (
              insert_err,
              insert_res,
              insert_fields
            ) {
              connection.release();

              if (insert_err) {
                console.log("insert_err ");
                callback(insert_err);
              }
              console.log("insert_results", insert_res);
              callback(null, "1");
            });
          } else {
            callback("2");
          }
        });
      });
    } else {
      callback(invalid_request);
    }
  } else if (http_method === "PUT") {
    let jobName = event["body-json"]["jobName"];
    let partId = event["body-json"]["partId"];
    let qty = event["body-json"]["qty"];

    console.log("inside put");
    console.log(jobName, partId, qty);

    const selectQuery = `SELECT * FROM jobs WHERE jobName = '${jobName}' and partId = '${partId}'`;
    context.callbackWaitsForEmptyEventLoop = false;
    db.getConnection(function (err, connection) {
      connection.query(selectQuery, function (
        select_err,
        select_result,
        select_fields
      ) {
        console.log("select_result", select_result);
        if (select_err) {
          console.log("select err");
          sql_err.body = select_err;
          callback(sql_err);
        } else if (select_result.length != 0) {
          console.log("inside select res if");

          const updateQuery = `UPDATE jobs
                       SET qty='${qty}'
                       WHERE jobName='${jobName}' AND partId='${partId}';`;

          connection.query(updateQuery, function (
            update_err,
            update_result,
            update_fields
          ) {
            connection.release();
            console.log("update_result", update_result);
            if (update_err) {
              console.log("update err");
              sql_err.body = update_err;
              callback(sql_err);
            }
            console.log("update_result 2");
            callback(null, "3");
          });
        } else {
          callback("4");
        }
      });
    });
  } else if (http_method === "DELETE") {
    let jobName = event["params"]["querystring"]["jobName"];
    let partId = event["params"]["querystring"]["partId"];

    if (!jobName || !partId) {
      callback(invalid_request);
    } else {
      let sql = `Delete from jobs where jobName ='${jobName}' and partId='${partId}';`;
      context.callbackWaitsForEmptyEventLoop = false;
      db.getConnection(function (err, connection) {
        connection.query(sql, (err, result) => {
          connection.release();
          if (err) {
            sql_err.body = err;
            callback(sql_err);
          }
          if (result["affectedRows"] === 0) {
            callback("5");
          } else {
            callback(null, "6");
          }
        });
      });
    }
  } else {
    callback(invalid_request);
  }
};

//https://www.youtube.com/watch?v=cGYknt3xIvM
