const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mySql = require("mysql-ssh");
const { query } = require("express");
const jwt = require('jsonwebtoken')
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var db = mySql.connect(
  //Connection string for the db
  {
    host: 'bluenose.cs.dal.ca',
    user: 'meganathan',
    password: 'B00851418',
    Port: 3306
  },
  {
    host: 'db.cs.dal.ca',
    user: 'meganathan',
    password: 'B00851418',
    database: 'meganathan'
  }
);

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

//fetching a specific job details based on the value entered in the textbox
app.get("/api/jobs/:jobName/", (req, res) => {
  let insertQuery = "Insert into Search values(?,?,?)"
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
    values = [req.params.jobName.trim().toLowerCase(), new Date(), (new Date()).toLocaleTimeString()]
    db.then((insertClient) => {
      insertClient.query(insertQuery, values, (err, records) => {
        if (err) {
          res.status(404).send('error occurred while inserting record in the database');
        }
      });
    }).catch(error => {
      console.log(error)
    })
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

//Fetching all the parts details for a job with jobName and partId
app.get('/api/parts/:jobName/:partId/', (req, res) => {
  if (req.params.jobName && req.params.partId) {
    let sqlQuery = 'select * from Jobs j inner join Parts p  on j.PartId = p.PartId where j.JobName=? and j.PartId=?'
    values = [req.params.jobName.trim().toLowerCase(), req.params.partId];
    db.then(client => {
      client.query(sqlQuery, values, (err, partDetails) => {
        if (err) {
          console.log(err)
          return res.status(404).send('error occurred while fetching jobs in the database');
        }
        if (Object.keys(partDetails).length === 0) {

          return res.status(404).send('No jobs or parts present in the database');
        }
        res.send(JSON.stringify(partDetails, undefined, 4));
      })
    })
  }
  else {
    res.status(404).send('something wrong with the input')
  }
});

//authenticating the user
process.env.SECRETKEY = 'secret'
app.get('/api/users/:username/:password', (req, res) => {
  if (req.params.username && req.params.password) {
    let sqlQuery = 'select * from Users where email=? and password=?'
    let values = [req.params.username, req.params.password];
    db.then(client => {
      client.query(sqlQuery, values, (err, results) => {
        if (err) {
          return res.status(404).send('credentials are wrong')
        }
        if (Object.keys(results).length==0) {
          let token = jwt.sign(req.params.username.trim().toLowerCase(), process.env.SECRETKEY)
          return res.send(`Login successful ` + token)
        }
        else {
          return res.send(`credentials are wrong`)
        }
      })
    })

  }
})

//method to insert the order in JobParts table
app.post('/api/updateOrder', (req, res) => {
  let insertQuery = 'Insert into JobParts values(?,?,?,?,?,?,?)'
  if (req.body) {
    values = [req.body.partId, req.body.jobName, req.body.userId, req.body.qty, (new Date()), (new Date()).toLocaleTimeString(),
    req.body.result]
    db.then(client => {
      client.query(insertQuery, values, (err, results) => {
        if (err) {
          return res.status(404).send(err)
        }
        res.send('Jobparts inserted successfully')
      }
      )
    }
    )
  }
})



//Invalid url handling
app.get("*", (_req, res) => {
  res.send("Invalid url, please enter valid url path");
});

function checkIfJobExists(jobName, callback) {
  if (jobName) {
    let query = "select * from Jobs where JobName like '%" + jobName.trim().toLowerCase() + "%'";

    db.then((client) => {
      client.query(query, (err, results) => {
        if (err) {
          callback("error occured while checking for data in the database");
        }
        callback(results, err);
      }).catch((err) => {
        console.log(err);
      });
    }
    )
  } else {
    callback("invalid JobName");
  }

}
