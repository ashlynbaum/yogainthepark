module.exports = function(basicAuth, bcrypt, usersCollection, formatUser){
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
              user = formatUser(user);
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