module.exports = function (body) {
  if (body.header && body.lead && body.body) return true;
  else return false;
};