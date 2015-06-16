var MongoClient = require('mongodb').MongoClient;
var mongoURI = ( process.env.MONGOLAB_URI || 'mongodb://localhost:27017/yoga' );

module.exports = function() {
  var db;

  return {
    init: function(done) {
      MongoClient.connect(mongoURI, function(err, database) {
        if (err) return done(err);

        db = database;
        done();
      });
    },

    clean: function(done) {
      db.dropDatabase(function() {
        done();
      });
    }
  };
};
