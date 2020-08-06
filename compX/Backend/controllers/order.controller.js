const { validationResult } = require('express-validator');
const db = require('../database/db');
const Order = require('../models/Order');
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

async function jobExist(req) {
  const jobName = req.body.jobName;
  const partID = req.body.partId;

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

async function createOrder(req) {
  const jobName = req.body.jobName;
  const partID = req.body.partId;
  const userID = req.body.userId;
  const qty = req.body.qty;

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
      console.log('Error with order creation');
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

  try {
    await db.query(`XA START '${tName}';`);

    await jobExist(req);
    await createOrder(req);

    await db.query(`XA END '${tName}';`);
    await db.query(`XA PREPARE '${tName}';`);

    res
      .status(200)
      .json({ isPrepared: true, message: 'Created order successfully' });
  } catch (err) {
    console.log(err);
    await db.query(`XA ROLLBACK '${tName}';`);

    const status = error.statusCode || 500;
    const message = error.message || 'Unknown error occured';

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
      message: `Operation ${oType} is successfully`,
    });
  } catch (err) {
    const status = error.statusCode || 500;
    const message = error.message || 'Unknown error occured';

    console.log(message);
    res.status(200).json({
      statusCode: status,
      operationSuccessful: false,
      message: message,
    });
  }
};
