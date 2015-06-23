var helpers = require('../../helpers');
var bcrypt = require('bcrypt');
var basicAuth = require('basic-auth');

module.exports = function(db){
  var usersCollection = db.collection('users');
  return function(req, res) {
    var basicAuthUser = basicAuth(req);
    if (!basicAuthUser) {
      res.status(403).end();
    } else {
      usersCollection.findOne( {email: basicAuthUser.name}, function(err, user) {
        if (!user) {
          res.status(403).end();
        } else {
          bcrypt.compare( basicAuthUser.pass, user.encryptedPassword, function(err, isSame) {
            if (isSame) {
              user = helpers.formatUser(user);
              res.status(200).send({auth_token: user.authToken});
            } else {
              res.status(403).end();
            }
          });
        }
      });
    }
  }
}