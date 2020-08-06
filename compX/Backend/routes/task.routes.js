const express = require('express');
const { body, param, query } = require('express-validator');

const taskController = require('../controllers/task.controller');

const router = express.Router();

router.put(
  '/jobs',
  [
    body('jobName').exists().withMessage('Value is required').isString(),
    body('partId').exists().withMessage('Value is required').isNumeric(),
    body('qty').exists().withMessage('Value is required').isNumeric(),
  ],
  taskController.updateTask
);
router.post(
  '/jobs',
  [
    body('jobName').exists().withMessage('Value is required').isString(),
    body('partId').exists().withMessage('Value is required').isNumeric(),
    body('qty').exists().withMessage('Value is required').isNumeric(),
  ],
  taskController.createTask
);

router.get('/jobs', taskController.getTasks);
router.get(
  '/jobById',
  [query('jobName').isString(), query('partId').isNumeric()],
  taskController.getTask
);
router.get(
  '/jobList',
  [query('jobName').isString()],
  taskController.getTaskByName
);

router.delete(
  '/jobs',
  [query('jobName').isString(), query('partId').isNumeric()],
  taskController.deleteTask
);

module.exports = router;
