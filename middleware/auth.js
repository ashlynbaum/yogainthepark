module.exports = function(db) {
  var usersCollection = db.collection('users');
  return function(req, res, next) {
    req = req.req || req;
    var authToken = req.headers.authorization;
    if (!authToken) return res.status(401).end();
    var parts = authToken.split(' ');
    if (parts[0].toLowerCase() !== 'token') return;
    if (!parts[1]) return;
    authToken = parts[1];
    usersCollection.findOne( { authToken: authToken }, function(err, user) {
      if (user) {
        req.user = user;
        next();
      } else {
        res.status(403).end();
      }
    });
  };
}
