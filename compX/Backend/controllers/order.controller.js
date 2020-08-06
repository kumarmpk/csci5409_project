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
