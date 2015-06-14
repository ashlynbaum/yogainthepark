var server = require('../../server');

var initDb = function(context) {
  before(function(done) {
    server.start(false, function(err, appStarted) {
      if (err) return done(err);

      context.app = appStarted;
      done();
    });
  });
};

exports.initDb = initDb;
