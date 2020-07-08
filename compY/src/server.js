require('dotenv').config()
const express = require('express');
const path = require('path')
const mysql = require('mysql');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(express.static(__dirname + '/build/'));

const db = mysql.createConnection({
  host: 'localhost',
  port: '3306',
  user: 'root',
  password: process.env.PASSWORD,
  database: process.env.DATABASE
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('MySql Connected');
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.get('/parts', (req, res) => {
  let sql = 'SELECT * FROM Parts'
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

app.get('/parts/:id', (req, res) => {

  let sql = `SELECT * FROM Parts WHERE partId = ${Number(req.params.id)}`
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      res.send(false);
    } else {
      res.status(200).send(result);
    }
  });
});

app.post('/parts/create', (req, res) => {

  let sql = 'SELECT * FROM Parts WHERE partId = ?';
  db.query(sql, Number(req.body.partId), (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length === 0) {
      let sql = 'INSERT INTO Parts VALUES (?,?,?)';
      let values = [Number(req.body.partId), req.body.partName, Number(req.body.qoh)];
      db.query(sql, values, (err, result) => {
        if (err) {
          throw err;
        }
        res.send('create success');
      });
    } else {
      res.send('Part with ID ' + req.body.partId + ' already exist');
    }
  });
});

app.put('/parts/update', (req, res) => {

  let sql = 'SELECT * FROM Parts WHERE partId = ?';
  db.query(sql, Number(req.body.partId), (err, result) => {
    if (err) {
      throw err;
    }
    if (result.length !== 0) {
      let sql = 'UPDATE Parts SET partName = ?, qoh = ? where partId = ?';
      let values = [req.body.partName, Number(req.body.qoh), Number(req.body.partId)];
      db.query(sql, values, (err, result) => {
        if (err) {
          throw err;
        }
        res.send('update success');
      });
    } else {
      res.send('Part with ID ' + req.body.partId + ' doesn\'t exist');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is runing on port: ${port}`);
});