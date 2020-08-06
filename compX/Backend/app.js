const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const taskRoutes = require('./routes/task.routes');
const orderRoutes = require('./routes/order.routes');
const db = require('./database/db');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', taskRoutes);
app.use('/api', orderRoutes);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  console.log(message);
  res.status(200).json({
    statusCode: status,
    message: message,
    data: data,
  });
});

db.sync()
  .then((result) => {
    // console.log(result);
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });
