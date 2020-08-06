const express = require("express");
const path = require("path");
const mysql = require("mysql");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/build/"));

const db = mysql.createConnection({
  host: "groupassignmentsdb.cibsusss4zqs.us-east-1.rds.amazonaws.com",
  user: "team_db",
  password: "4A98d8Gx",
  port: 3306,
  database: "companies",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("MySql Connected");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.get("/parts", (req, res) => {
  let sql = "SELECT * FROM parts";
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

app.get("/parts/:id", (req, res) => {
  let sql = `SELECT * FROM parts WHERE partId = ${Number(req.params.id)}`;
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      res.send(false);
    } else {
      res.status(200).send(result);
    }
  });
});

app.post("/parts/create", (req, res) => {
  let sql = "SELECT * FROM parts WHERE partId = ?";
  db.query(sql, Number(req.body.partId), (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      let sql = "INSERT INTO parts VALUES (?,?,?)";
      let values = [
        Number(req.body.partId),
        req.body.partName,
        Number(req.body.qoh),
      ];
      db.query(sql, values, (err, result) => {
        if (err) {
          throw err;
        }
        res.send("create success");
      });
    } else {
      res.send("Part with ID " + req.body.partId + " already exist");
    }
  });
});

app.put("/parts/update", (req, res) => {
  let sql = "SELECT * FROM parts WHERE partId = ?";
  db.query(sql, Number(req.body.partId), (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length !== 0) {
      let sql = "UPDATE parts SET partName = ?, qoh = ? where partId = ?";
      let values = [
        req.body.partName,
        Number(req.body.qoh),
        Number(req.body.partId),
      ];
      db.query(sql, values, (err, result) => {
        if (err) {
          throw err;
        }
        res.send("update success");
      });
    } else {
      res.send("Part with ID " + req.body.partId + " doesn't exist");
    }
  });
});

app.get("/order", (req, res) => {
  let sql = "SELECT * FROM partordersY order by jobName, userId, partId";
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

app.post("/order", async (req, res) => {
  // need start XA transaction here
  try {
    await db.query(`XA START '${req.body.transactionName}';`);

    let sql = "INSERT INTO partordersY Values (?,?,?,?)";
    let values = [
      req.body.jobName,
      Number(req.body.partId),
      req.body.userId,
      Number(req.body.qty),
    ];

    await axios
      .get(
        `http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/parts/${Number(
          req.body.partId
        )}`
      )
      .then(async (res) => {
        if (res.data[0].qoh - Number(req.body.qty) >= 0) {
          await axios.put(
            "http://companyy-env.eba-faeivpbr.us-east-1.elasticbeanstalk.com/parts/update",
            {
              partName: res.data[0].partName,
              qoh: res.data[0].qoh - Number(req.body.qty),
              partId: Number(req.body.partId),
            }
          );

          await db.query(sql, values, async (err, result) => {
            if (err) {
              throw err;
            }
          });

          await db.query(`XA END '${req.body.transactionName}';`);
          await db.query(`XA PREPARE '${req.body.transactionName}';`);

          res.status(200).json({
            isPrepared: true,
            message: "Created order successfully",
          });
        } else {
          await db.query(`XA ROLLBACK '${req.body.transactionName}';`);

          const status = error.statusCode || 500;
          const message = error.message || "Unknown error occured";

          console.log(message);
          res.status(200).json({
            statusCode: status,
            isPrepared: false,
            message: message,
          });
        }
      });
  } catch (error) {
    console.log(error);
    await db.query(`XA ROLLBACK '${req.body.transactionName}';`);

    const status = error.statusCode || 500;
    const message = error.message || "Unknown error occured";

    console.log(message);
    res.status(200).json({
      statusCode: status,
      isPrepared: false,
      message: message,
    });
  }
});

app.post("/finishOrder", async (req, res) => {
  const oType = req.body.operationType;
  const tName = req.body.transactionName;

  try {
    if (oType.toLowerCase() == "commit") {
      await db.query(`XA COMMIT '${tName}';`);
    } else if (oType.toLowerCase() == "rollback") {
      await db.query(`XA ROLLBACK '${tName}';`);
    } else {
      throw new Error("Unknown transaction type");
    }

    res.status(200).json({
      operationSuccessful: true,
      message: `Operation ${oType} is successfully`,
    });
  } catch (err) {
    const status = error.statusCode || 500;
    const message = error.message || "Unknown error occured";

    console.log(message);
    res.status(200).json({
      statusCode: status,
      operationSuccessful: false,
      message: message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is runing on port: ${port}`);
});
