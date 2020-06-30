const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mySql = require("mysql-ssh");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var db = mySql.connect();

port = process.env.Port || 3000;
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
  let sqlQuery = "Select * from Jobs";
  db.then((client) => {
    client.query(sqlQuery, (err, allJobs) => {
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
  }).catch((err) => {
    console.log(err);
  });
});

//fetching a specific job details
app.get("/api/jobs/:jobName/", (req, res) => {
  var callback = (jobToFetch, error) => {
    if (error) {
      return res418
        .status(404)
        .send("error occurred while fetching job from the database");
    }
    if (Object.keys(jobToFetch).length === 0) {
      return res
        .status(404)
        .send("job not found, please enter another job name");
    }
    res.send(JSON.stringify(jobToFetch, undefined, 4));
  };
  checkIfJobExists(req.params.jobName, callback);
});

//Fetching all the parts details for a job
app.get("/api/parts/:jobName/", (req, res) => {
  if (req.params.jobName) {
    let sqlQuery =
      "select * from Jobs j inner join Parts p  on j.PartId = p.PartId where j.JobName=?";
    values = [req.params.jobName.trim().toLowerCase()];
    db.then((client) => {
      client.query(sqlQuery, values, (err, allJobs) => {
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
    });
  } else {
    res.status(404).send("something wrong with the input");
  }
});

//Invalid url handling
app.get("*", (_req, res) => {
  res.send("Invalid url, please enter valid url path");
});

function checkIfJobExists(jobName, callback) {
  if (jobName) {
    let query = "select * from Jobs where JobName = ?";
    if (jobName) {
      values = [jobName.trim().toLowerCase()];
      db.then((client) => {
        client.query(query, values, (err, results) => {
          if (err) {
            callback("error occured while checking for data in the database");
          }
          callback(results, err);
        });
      }).catch((err) => {
        console.log(err);
      });
    } else {
      callback("invalid JobName and partID");
    }
  }
}
