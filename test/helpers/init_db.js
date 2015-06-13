var assert = require('chai').assert;
var request = require('supertest');
var server = require('../../server');

var initDb = function(context) {
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

  before(function(done) {
    server.start(false, function(err, appStarted) {
      context.app = appStarted;
      done();
    });
  });

};

exports.initDb = initDb;
