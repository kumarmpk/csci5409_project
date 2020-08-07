const db = require('./db');

exports.queryDb = (query) => {
  return new Promise(function (resolve, reject) {
    db.query(query, function (err, results, fields) {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};
