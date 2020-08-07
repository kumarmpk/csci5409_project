const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'groupassignmentsdb.cibsusss4zqs.us-east-1.rds.amazonaws.com',
  user: 'team_db',
  password: '4A98d8Gx',
  port: 3306,
  database: 'partcorp',
});

module.exports = db;
