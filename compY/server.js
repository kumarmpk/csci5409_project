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
      res.send(result);
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

app.post("/order", async (req, result) => {
  // need start XA transaction here

  const tName = req.body.transactionName;

  try {
    await db.query(`XA START '${tName}';`);

    let sql = "INSERT INTO partordersY Values (?,?,?,?)";
    let values = [
      req.body.jobName,
      Number(req.body.partId),
      req.body.userId,
      Number(req.body.qty),
    ];

    let sql_part = `SELECT * FROM parts WHERE partId = ${Number(
      req.body.partId
    )}`;

    await db.query(sql_part, async (err, res) => {
      if (err) {
        throw err;
      }
      if (res[0].qoh - Number(req.body.qty) >= 0) {
        let sql_update =
          "UPDATE parts SET partName = ?, qoh = ? where partId = ?";
        let values_update = [
          res[0].partName,
          res[0].qoh - Number(req.body.qty),
          Number(req.body.partId),
        ];

        await db.query(sql_update, values_update, (err, res) => {
          if (err) {
            throw err;
          }
        });

        await db.query(sql, values, async (err, res) => {
          if (err) {
            throw err;
          }
        });

        await db.query(`XA END '${tName}';`);
        await db.query(`XA PREPARE '${tName}';`);

        result.send(
          JSON.stringify({
            isPrepared: true,
            message: "Created order successfully",
          })
        );
      } else {
        try {
          await db.query(`XA END '${tName}';`);
          await db.query(`XA PREPARE '${tName}';`);
          await db.query(`XA ROLLBACK '${tName}';`);
        } catch {}

        result.send(
          JSON.stringify({
            isPrepared: false,
          })
        );
      }
    });
  } catch (error) {
    try {
      await db.query(`XA END '${tName}';`);
      await db.query(`XA PREPARE '${tName}';`);
      await db.query(`XA ROLLBACK '${tName}';`);
    } catch {}

    console.log(error);

    const status = error.statusCode || 500;
    const message = error.message || "Unknown error occured";

    console.log(message);
    result.send(
      JSON.stringify({
        statusCode: status,
        isPrepared: false,
        message: message,
      })
    );
  }
});

app.post("/finishOrder", async (req, result) => {
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

    result.send(
      JSON.stringify({
        operationSuccessful: true,
        message: `Operation ${oType} is successfully`,
      })
    );
  } catch (error) {
    const status = error.statusCode || 500;
    const message = error.message || "Unknown error occured";

    console.log(message);
    result.send(
      JSON.stringify({
        statusCode: status,
        operationSuccessful: false,
        message: message,
      })
    );
  }
});

app.listen(port, () => {
  console.log(`Server is runing on port: ${port}`);
});
