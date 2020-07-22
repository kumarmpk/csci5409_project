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
        body: ""
    };
    let invalid_request = {
        statusCode: 400,
        body: "The request is invalid."
    };

    let http_method = event.http_method;
    let jobName = event.jobName;
    let partId = event.partId;
    let qty = event.qty;
    let userId = event.userId;

    if (http_method === "GET") {
        if ((!jobName || jobName === "") && (!partId || partId === "")) {
            context.callbackWaitsForEmptyEventLoop = false;
            let selectAllJobsQuery = "select * from jobs";
            db.getConnection(function(err, connection) {
                connection.query(selectAllJobsQuery, function(error, results, fields) {
                    connection.release();
                    if (error) {
                        sql_err.body = error;
                        callback(sql_err);
                    } else callback(null, results);
                });
            });
        } else if ((jobname && jobName !== "") && (!partId || partId === "")) {
            const jobName = event.jobName;
            console.log("jobName", jobName);

            let selectJobByName = `select * from jobs where lower(jobName) like "%${jobName.toLowerCase()}%";`;

            context.callbackWaitsForEmptyEventLoop = false;
            db.getConnection(function(err, connection) {
                connection.query(selectJobByName, function(error, results, fields) {
                    connection.release();
                    if (error) {
                        sql_err.body = error;
                        callback(sql_err);
                    } else callback(null, results);
                });
            });
        } else if (jobName && jobName !== "" && partId && partId !== "") {
            //
            ////////////////////////////////////////////////////////////
            //
        } else {
            callback(invalid_request);
        }
    } else if (http_method === "POST") {


        if (jobName && jobName !== "" && partId && partId !== "" && qty && qty !== "" && (!userId || userId === "")) {
            if (jobName && jobName !== "")
                let selectQuery =
                    `select * from jobs where jobName = ${jobName} and partId = ${partId};`;

            context.callbackWaitsForEmptyEventLoop = false;
            db.getConnection(function(err, connection) {
                connection.query(selectQuery, function(
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
                        connection.query(insertQuery, insertData, function(
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
        } else if (jobName && jobName !== "" && partId && partId !== "" && qty && qty !== "" && userId && userId !== "") {
            //
            //////////////////////////////////////////
            //
        } else {
            callback(invalid_request);
        }
    } else if (http_method === "PUT") {
        const selectQuery = `SELECT * FROM jobs WHERE jobName = "${jobName}" and partId =${partId}`;

        db.getConnection(function (err, connection) {
            db.query(selectQuery, (select_err, select_result) => {
                if (select_result.length != 0) {
                    const updateQuery = `UPDATE jobs
                       SET qty=${qty}
                       WHERE jobName="${jobName}" AND partId=${partId};`;

                    db.query(updateQuery, (update_err, update_result) => {
                        connection.release();
                        if (update_err) {
                            throw update_err;
                        }
                        callback(null, "3");
                    });
                } else {
                    callback("4");
                }
            });
        })
    } else if (http_method === "DELETE") {
        if (!jobName || !partId) {
            callback(invalid_request);
        } else {
            let sql = `Delete from jobs where jobName ='${jobName}' and partId=${partId}`;
            db.getConnection(function (err, connection) {
                db.query(sql, (err, result) => {
                    connection.release();
                    if (err) {
                        sql_err.body = err
                        callback(sql_err)
                    }
                    if (result.length == 0) {
                        callback('5')
                    } else {
                        callback(null, '6')
                    }
                });
            })
        }
    }
};

//https://www.youtube.com/watch?v=cGYknt3xIvM