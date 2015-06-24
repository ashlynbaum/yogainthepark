var crypto = require('crypto');

// Use node crypto to generate random bytes asyncronously
module.exports = function(cb) {
  crypto.randomBytes(32, function(err, buffer) {
    if (err) {
      // set timout to allow for entropy to be generated
      setTimeout(function() { genToken(cb); }, 100);
    } else {
      // call the callback passing the buffer converted to string as an argument
      cb(null, buffer.toString('hex'));
    }
  });
}