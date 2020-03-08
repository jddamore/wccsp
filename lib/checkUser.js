module.exports = async function (body, database) {
  if (!body.email || !body.password) {
    console.log('yo');
    return false;
  }
  else {
    database.collection('users').findOne( { username: body.email }, function (err, result) {
      if (err || !result) return false;
      else {
        if (body.password === result.password) {
          console.log('yo2');
          return true; 
        }
        else {
          console.log('yo3');
          return false;
        }
      }
    });
  }
};