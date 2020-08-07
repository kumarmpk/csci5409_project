const express = require("express");
const path = require("path");
const cors = require("cors");
const dbHelper = require("./database/db.helper");
const db = require("./database/db");

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname + "/build/"));

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
  let sql = "SELECT * FROM Parts";
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

app.get("/parts/:id", (req, res) => {
  let sql = `SELECT * FROM Parts WHERE partId = ${Number(req.params.id)}`;
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
  let sql = "SELECT * FROM Parts WHERE partId = ?";
  db.query(sql, Number(req.body.partId), (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      let sql = "INSERT INTO Parts VALUES (?,?,?)";
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
  let sql = "SELECT * FROM Parts WHERE partId = ?";
  db.query(sql, Number(req.body.partId), (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length !== 0) {
      let sql = "UPDATE Parts SET partName = ?, qoh = ? where partId = ?";
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
  let sql = "SELECT * FROM PartOrders order by jobName, userId, partId";
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

  let query = `INSERT INTO PartOrders (jobName, partId, userId, qty) VALUES ('${jobName}', ${partID}, '${userId}', ${qty})`;

  return dbHelper
    .queryDb(query)
    .then((result) => {
      return "Success";
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      throw err;
    });
}

async function checkParts(item) {
  const partID = item.partId;
  const qty = Number(item.qty);

  let query = `SELECT * FROM Parts WHERE partId = ${partID}`;

  return dbHelper
    .queryDb(query)
    .then((parts) => {
      // eslint-disable-next-line eqeqeq
      if (parts === undefined || parts.length == 0) {
        const error = new Error(`Part with part: ${partID} does not exist`);
        error.statusCode = 204;
        throw error;
      } else {
        return parts[0];
      }
    })
    .then((part) => {
      const dif = part.qoh - qty;
      if (dif >= 0) {
        let query = `UPDATE Parts SET partName = '${part.partName}', qoh = ${dif} WHERE partId = ${partID}`;
        return dbHelper.queryDb(query);
      } else {
        const error = new Error(`The current storage of parts is too low.`);
        error.statusCode = 500;
        throw error;
      }
    })
    .then((result) => {
      return "Success";
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      throw err;
    });
}

app.post("/orders", async (req, res) => {
  // need start XA transaction here

  const tName = req.body.transactionName;
  const orderItems = req.body.order;

  try {
    await dbHelper.queryDb(`XA START '${tName}';`);

    for (var i = 0; i < orderItems.length; i++) {
      await checkParts(orderItems[i]);
      await createOrder(orderItems[i]);
    }

    await dbHelper.queryDb(`XA END '${tName}';`);
    await dbHelper.queryDb(`XA PREPARE '${tName}';`);

    res.json({
      isPrepared: true,
      message: "Created order successfully",
    });
  } catch (err) {
    console.log(err);
    try {
      await dbHelper.queryDb(`XA END '${tName}';`);
      await dbHelper.queryDb(`XA PREPARE '${tName}';`);
      await dbHelper.queryDb(`XA ROLLBACK '${tName}';`);
    } catch {}

    const status = err.statusCode || 500;
    const message = err.message || "Unknown error occured";

    console.log(message);
    res.status(200).json({
      statusCode: status,
      isPrepared: false,
      message: message,
    });
  }
});

app.post("/orders/finish", async (req, res) => {
  const oType = req.body.operationType;
  const tName = req.body.transactionName;

  try {
    if (oType.toLowerCase() == "commit") {
      await dbHelper.queryDb(`XA COMMIT '${tName}';`);
    } else if (oType.toLowerCase() == "rollback") {
      await dbHelper.queryDb(`XA ROLLBACK '${tName}';`);
    } else {
      throw new Error("Unknown transaction type");
    }

    res.status(200).json({
      operationSuccessful: true,
      message: `Operation ${oType} is successful`,
    });
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || "Unknown error occured";

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
