const { validationResult } = require('express-validator');
const Order = require('../models/Order');

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

exports.createTask = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const jobName = req.body.jobName;
  const partID = req.body.partId;
  const userID = req.body.userId;
  const qty = req.body.qty;

  Order.create({ jobName: jobName, partId: partID, userId: userID, qty: qty })
    .then(() => {
      res.status(201).json({
        message: 'New job was successfully created',
        result: { jobName: jobName, partId: partID, userId: userID, qty: qty },
      });
    })
    .catch((err) => {
      if (err.original.sqlMessage.includes('Duplicate entry')) {
        err.message = `Order already exists`;
        err.statusCode = 409;
      }

      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
