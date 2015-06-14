var assert = require('chai').assert;
var request = require('supertest');
var server = require('../server');


describe('authentication of users', function() {
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
  describe('GET /test', function() {
    it('should get 200 for test endpoint', function(done) {
      request(app)
        .get('/test')
        .expect(200)
        .end(done);
    });
  });
  describe('POST /signup', function() {
    var signupRequest = function() {
      return request(app)
        .post('/signup')
        .send({'email': 'a@example.com', 'password': 'sample'});
    };
    it('should recieve a 200 and authentication token', function(done) {
      signupRequest()
        .expect(200)
        .expect(function(res) {
          assert.match(res.body.authToken, /[a-f\d]{64}/);
        })
        .end(done);
    });
    it('should recieve a 422 when emails already exists in database', function(done) {
      signupRequest()
        .expect(200)
        .end(function() {
          signupRequest()
            .expect(422)
            .end(done);
        });
    });
    it('should fail if email is not valid', function(done) {
      request(app)
        .post('/signup')
        .send({'email': 'aaaaaa.com', 'password': 'sample'})
        .expect(422)
        .expect('Invalid email')
        .end(done);
    });
  });
});
