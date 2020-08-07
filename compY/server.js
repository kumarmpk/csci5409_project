const express = require("express");
const path = require("path");
const mysql = require("mysql");
const cors = require("cors");

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

// helper method

async function createOrder(item) {
  const jobName = item.jobName;
  const partID = item.partId;
  const userId = item.userId;
  const qty = item.qty;

  let sql = "INSERT INTO partordersY Values (?,?,?,?)";
  let values = [jobName, partID, userId, qty];

  await db.query(sql, values, async (err, res) => {
    if (err) {
      throw err;
    }
  });
}

async function checkParts(item) {
  const partID = item.partId;
  const qty = item.qty;
  let sql = `SELECT * FROM parts WHERE partId = ${Number(partID)}`;
  await db.query(sql, async (err, res) => {
    if (err) {
      throw err;
    }
    if (res[0].qoh - Number(qty) >= 0) {
      let sql = "UPDATE parts SET partName = ?, qoh = ? where partId = ?";
      let values = [res[0].partName, res[0].qoh - Number(qty), Number(partID)];

      await db.query(sql, values, (err, res) => {
        if (err) {
          throw err;
        }
      });
      return true;
    } else {
      await db.query(`XA END '${tName}';`);
      await db.query(`XA PREPARE '${tName}';`);
      await db.query(`XA ROLLBACK '${tName}';`);
      return false;
    }
  });
}

app.post("/order", async (req, result) => {
  // need start XA transaction here

  const tName = req.body.transactionName;
  const orderItems = req.body.order;

  try {
    await db.query(`XA START '${tName}';`);
    let index;
    for (var i = 0; i < orderItems.length; i++) {
      console.log(await checkParts(orderItems[i]));

      await createOrder(orderItems[i]);
      index = i;
    }

    if (index == orderItems.length - 1) {
      await db.query(`XA END '${tName}';`);
      await db.query(`XA PREPARE '${tName}';`);
      result.send(
        JSON.stringify({
          isPrepared: true,
          message: "Created order successfully",
        })
      );
    } else {
      result.send(
        JSON.stringify({
          isPrepared: false,
          message: "Part not succificient",
        })
      );
    }
  } catch (error) {
    try {
      await db.query(`XA END '${tName}';`);
      await db.query(`XA PREPARE '${tName}';`);
      await db.query(`XA ROLLBACK '${tName}';`);
    } catch {}

    const status = error.statusCode || 500;
    const message = error.message || "Unknown error occured";

    return result.send(
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

    return result.send(
      JSON.stringify({
        operationSuccessful: true,
        message: `Operation ${oType} is successfully`,
      })
    );
  } catch (error) {
    try {
      await db.query(`XA END '${tName}';`);
      await db.query(`XA PREPARE '${tName}';`);
      await db.query(`XA ROLLBACK '${tName}';`);
    } catch {}
    const status = error.statusCode || 500;
    const message = error.message || "Unknown error occured";

    console.log(message);
    return result.send(
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
