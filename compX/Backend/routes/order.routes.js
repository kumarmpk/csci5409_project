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
    body('transactionName')
      .exists()
      .withMessage('Value is required')
      .isString(),
  ],
  orderController.createOrder
);

router.post(
  '/orders/finish',
  [
    body('transactionName')
      .exists()
      .withMessage('Value is required')
      .isString(),
    body('operationType').exists().withMessage('Value is required').isString(),
  ],
  orderController.finishOrder
);

router.get('/orders', orderController.getOrders);

module.exports = router;
