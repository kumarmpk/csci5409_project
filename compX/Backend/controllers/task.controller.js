const { Op } = require("sequelize");
const { validationResult } = require("express-validator");
const Task = require("../models/task");

exports.getTasks = (req, res, next) => {
  Task.findAll()
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

exports.getTask = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const jobName = req.query.jobName;
  const partID = req.query.partId;

  Task.findOne({
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
        res.status(200).send({
          result: task,
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getTaskByName = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const jobName = req.query.jobName;

  Task.findAll({
    where: {
      jobName: jobName,
    },
  })
    .then((tasks) => {
      if (!tasks || tasks.length == 0) {
        const error = new Error(`Job with jobName: ${jobName} does not exist`);
        error.statusCode = 204;
        throw error;
      } else {
        res.status(200).send({
          result: tasks,
        });
      }
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
  const qty = req.body.qty;

  Task.create({ jobName: jobName, partId: partID, qty: qty })
    .then(() => {
      res.status(201).json({
        message: "New job was successfully created",
        result: { jobName: jobName, partId: partID, qty: qty },
      });
    })
    .catch((err) => {
      if (err.original.sqlMessage.includes("Duplicate entry")) {
        err.message = `Job with jobName: ${jobName} and partID: ${partID} already exists`;
        err.statusCode = 409;
      }

      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.updateTask = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const jobName = req.body.jobName;
  const partID = req.body.partId;
  const qty = req.body.qty;

  Task.update(
    { qty: qty },
    {
      where: {
        jobName: jobName,
        partId: partID,
      },
    }
  )
    .then((updatedRows) => {
      if (updatedRows.length > 0 && updatedRows[0] == 0) {
        const error = new Error(
          `Job with jobName: ${jobName} and partID: ${partID} does not exist`
        );
        error.statusCode = 204;
        throw error;
      }

      const message = "Job has been updated successfully";

      res.status(200).json({
        message: message,
        result: { jobName: jobName, partId: partID, qty: qty },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deleteTask = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const jobName = req.query.jobName;
  const partID = req.query.partId;

  Task.destroy({
    where: {
      jobName: jobName,
      partId: partID,
    },
  })
    .then((tasks) => {
      if (tasks == 0) {
        const error = new Error(
          `Job with jobName: ${jobName} and partID: ${partID} does not exist`
        );
        error.statusCode = 204;
        throw error;
      } else {
        res.status(200).send({
          message: "Job has been delete successfully",
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
