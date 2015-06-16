var request = require('supertest');
var server = require('../../server');

module.exports = function() {
  var app;

  return {
    startApp: function(done) {
      server.start(false, function(err, appStarted) {
        if (err) { return done(err); }
        app = appStarted;
        done();
      });
    },
    r: function() {
      return request(app);
    }
  };
};
