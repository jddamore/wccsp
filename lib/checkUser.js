module.exports = function (body, database, cb) {
  if (!database || !body.email || !body.password) {
    console.log('yo');
    cb(false);
  }
  else {
    database.collection('users').findOne( { username: body.email }, function (err, result) {
      if (err || !result) cb(false);
      else {
        if (body.password === result.password) {
          console.log('yo2');
          cb(true);
        }
        else {
          console.log('yo3');
          cb(false);
        }
      }
    });
  }
};