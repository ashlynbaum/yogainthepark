var helpers = require('../../helpers');
var bcrypt = require('bcrypt');


module.exports = function (db) {
  var insertUserWithToken = helpers.insertUserWithToken(db);
  var usersCollection = db.collection('users');
  var validateEmail = helpers.validateEmail;
  return function(req, res){
    var isEmail = validateEmail(req.body.email);
    if (!isEmail) {
      res.status(422).send('Invalid email');
    } else {
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          usersCollection.findOne({email: req.body.email}, function(err, user) {
            if (!user) {
              user = {email: req.body.email, encryptedPassword: hash};
              insertUserWithToken(user, function(err, user) {
                // res.status(200).send('authToken is ' + user.authToken);
                res.status(200).send({'authToken': user.authToken})
              });
            } else {
              res.status(422).send('This user email already exists.');
            }
          });
        });
      });
    }
  }
}