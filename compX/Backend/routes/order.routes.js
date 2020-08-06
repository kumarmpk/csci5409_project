const express = require('express');
const { body, param, query } = require('express-validator');

const orderController = require('../controllers/order.controller');

const router = express.Router();

// router.put(
//   '/jobs',
//   [
//     body('jobName').exists().withMessage('Value is required').isString(),
//     body('partId').exists().withMessage('Value is required').isNumeric(),
//     body('qty').exists().withMessage('Value is required').isNumeric(),
//   ],
//   orderController.updateJob
// );
// router.post(
//   '/jobs',
//   [
//     body('jobName').exists().withMessage('Value is required').isString(),
//     body('partId').exists().withMessage('Value is required').isNumeric(),
//     body('qty').exists().withMessage('Value is required').isNumeric(),
//   ],
//   orderController.createJob
// );

router.get('/orders', orderController.getJobs);
// router.get(
//   '/jobById',
//   [query('jobName').isString(), query('partId').isNumeric()],
//   orderController.getJob
// );
// router.get(
//   '/jobList',
//   [query('jobName').isString()],
//   orderController.getJobByName
// );

// router.delete(
//   '/jobs',
//   [query('jobName').isString(), query('partId').isNumeric()],
//   orderController.deleteJob
// );

module.exports = router;
