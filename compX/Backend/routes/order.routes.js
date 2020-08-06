const express = require('express');
const { body, param, query } = require('express-validator');

const orderController = require('../controllers/order.controller');

const router = express.Router();

router.post(
  '/orders',
  [
    body('jobName').exists().withMessage('Value is required').isString(),
    body('partId').exists().withMessage('Value is required').isNumeric(),
    body('userId').exists().withMessage('Value is required').isString(),
    body('qty').exists().withMessage('Value is required').isNumeric(),
  ],
  orderController.createTask
);

router.get('/orders', orderController.getOrders);

module.exports = router;
