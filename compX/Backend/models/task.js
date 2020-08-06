const { Sequelize, DataTypes } = require('sequelize');

const db = require('../database/db');

const Task = db.define(
  'Task',
  {
    jobName: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    partId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'Tasks',
  }
);

module.exports = Task;
