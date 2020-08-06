const Sequelize = require('sequelize');

const db = new Sequelize('taskcorp', 'team_db', '4A98d8Gx', {
  dialect: 'mysql',
  host: 'groupassignmentsdb.cibsusss4zqs.us-east-1.rds.amazonaws.com',
});

module.exports = db;
