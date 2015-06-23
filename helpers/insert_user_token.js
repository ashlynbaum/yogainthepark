var genToken = require('./gen_token');
// Generate token and TRY to insert user into collection
// if error, try again recursively
module.exports = function(db) {
  var usersCollection = db.collection('users');
  return function(user, cb) {
    genToken(function(err, token) {
      // insert user into databse
      user.authToken = token;
      usersCollection.insert(user, function(err, result) {
        if (err) {
          insertUserWithToken(user, cb);
        } else {
          // call the callback passing the inserted user as an argument
          cb(null, result.ops[0]);
        }
      });
    });
  };
};
