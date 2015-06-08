var initDb = function() {
  before(function(done) {
    server.start(false, function(err, appStarted) {
      global.app = appStarted;
      done();
    });
  });

  var db;
  // define database
  before(function(done) {
    var MongoClient = require('mongodb').MongoClient;
    // Connection URL for database
    var url = ( process.env.MONGOLAB_URI || 'mongodb://localhost:27017/yoga' );
    // hook to database before each hook
    MongoClient.connect(url, function(err, database) {
      db = database;
      done();
    });
  });


  beforeEach(function(done) {
    db.dropDatabase(function() {
      done();
    });
  });
};

exports.initDb = initDb;
