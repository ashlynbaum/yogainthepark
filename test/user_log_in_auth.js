var assert = require('chai').assert;
var expect = require('chai').expect;
var request = require('supertest');
var server = require('../server');



describe('users basic auth login', function() {
  var app;
  before(function(done) {
    server.start(false, function(err, appStarted) {
      app = appStarted;
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

  describe('Get /' ,function() {
    var signupRequest = function() {
      return request(app)
        .post('/signup')
        .send({'email': 'a@example.com', 'password': 'sample'});
    };
    it('should recieve a 200 and user authentication token', function(done) {
      signupRequest()
        .expect(200)
        .end(function() {
          request(app)
            .get('/')
            .auth('a@example.com', 'sample')
            .expect(200)
            .expect(/[a-f\d]{24}/)
            .end(done);
        });
    });
    it('should recieve a 200 and user authentication token', function(done) {
      signupRequest()
        .expect(200)
        .end(function() {
          request(app)
            .get('/')
            .auth('a@example.com', 'sample')
            .expect(200)
            .expect(/[a-f\d]{24}/)
            .end(done);
        });
    });

    it('should recieve a 403 if user does not exist', function(done) {
      signupRequest()
        .expect(200)
        .end(function() {
          request(app)
            .get('/')
            .auth('nonExistantUser@example.com', 'sample')
            .expect(403, done);
        });
    });

    it('should recieve a 403 and user password does not match', function(done) {
      signupRequest()
        .expect(200)
        .end(function() {
          request(app)
            .get('/')
            .auth('a@example.com', 'newpassword')
            .expect(403, done);
        });
    });
  });
});
