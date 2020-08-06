const { Sequelize, DataTypes } = require('sequelize');

const db = require('../database/db');

const Order = db.define(
  'Order',
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
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    qty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'TaskOrders',
  }
);

module.exports = Order;
