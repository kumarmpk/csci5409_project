const { validationResult } = require('express-validator');
const db = require('../database/db');
const Order = require('../models/order');
const Task = require('../models/task');

exports.getOrders = (req, res, next) => {
  Order.findAll()
    .then((tasks) => {
      res.status(200).send({
        result: tasks,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

// ------- HELPERS START -------

async function jobExist(item) {
  console.log(item);
  const jobName = item.jobName;
  const partID = item.partId;

  return Task.findOne({
    where: {
      jobName: jobName,
      partId: partID,
    },
  })
    .then((task) => {
      if (task === undefined || task === null) {
        const error = new Error(
          `Job with jobName: ${jobName} and partID: ${partID} does not exist`
        );
        error.statusCode = 204;
        throw error;
      } else {
        return 'Success';
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log('Error with job check');
      throw err;
    });
}

async function createOrder(item) {
  const jobName = item.jobName;
  const partID = item.partId;
  const userID = item.userId;
  const qty = item.qty;

  return Order.create({
    jobName: jobName,
    partId: partID,
    userId: userID,
    qty: qty,
  })
    .then(() => {
      return 'Success';
    })
    .catch((err) => {
      if (err.original.sqlMessage.includes('Duplicate entry')) {
        err.message = `Order already exists`;
        err.statusCode = 409;
      }

      if (!err.statusCode) {
        err.statusCode = 500;
      }

      throw err;
    });
}

// ------- HELPERS FINISHED -------

exports.createOrder = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ isPrepared: false, message: errors.array() });
  }

  const tName = req.body.transactionName;
  const orderItems = req.body.order;

  try {
    await db.query(`XA START '${tName}';`);

    for (var i = 0; i < orderItems.length; i++) {
      await jobExist(orderItems[i]);
      await createOrder(orderItems[i]);
    }

    await db.query(`XA END '${tName}';`);
    await db.query(`XA PREPARE '${tName}';`);

    res
      .status(200)
      .json({ isPrepared: true, message: 'Created order successfully' });
  } catch (err) {
    try {
      await db.query(`XA END '${tName}';`);
      await db.query(`XA PREPARE '${tName}';`);
      await db.query(`XA ROLLBACK '${tName}';`);
    } catch {}

    const status = err.statusCode || 500;
    const message = err.message || 'Unknown error occured';

    console.log(message);
    res.status(200).json({
      statusCode: status,
      isPrepared: false,
      message: message,
    });
  }
};

exports.finishOrder = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ operationSuccessful: false, errors: errors.array() });
  }

  const oType = req.body.operationType;
  const tName = req.body.transactionName;

  try {
    if (oType.toLowerCase() == 'commit') {
      await db.query(`XA COMMIT '${tName}';`);
    } else if (oType.toLowerCase() == 'rollback') {
      await db.query(`XA ROLLBACK '${tName}';`);
    } else {
      throw new Error('Unknown transaction type');
    }

    res.status(200).json({
      operationSuccessful: true,
      message: `Operation ${oType} is successful`,
    });
  } catch (err) {
    const status = err.statusCode || 500;
    const message = err.message || 'Unknown error occured';

    console.log(message);
    res.status(200).json({
      statusCode: status,
      operationSuccessful: false,
      message: message,
    });
  }
};
