var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var request = require('supertest');
var server = require('../server');
var initApp = require('./helpers/init_db');

describe('Events', function() {
  var context = {};

  var db;
  // define database
  before(function(done) {
    var MongoClient = require('mongodb').MongoClient;
    // Connection URL for database
    var url = ( process.env.MONGOLAB_URI || 'mongodb://localhost:27017/yoga' );
    // hook to database before each hook
    MongoClient.connect(url, function(err, database) {
      if (err) { return done(err) }
      db = database;
      done();
    });
  });


  before(function(done) {
    db.dropDatabase(function() {
      done();
    });
  });

  before(function(done) {
    server.start(false, function(err, appStarted) {
      if (err) { return done(err) }
      context.app = appStarted;
      done();
    });
  });

  describe('GET /test', function() {
    it('should get 200 for test endpoint', function(done) {
      request(context.app)
        .get('/test')
        .expect(200)
        .end(done);
    });
  });

  describe('GET /events', function() {
    describe('list all events', function() {
      it('should create first example event', function(done) {
        request(context.app)
          .post('/signup')
          .send({'email': 'a@example.com', 'password': 'sample'})
          .expect(200)
          .end(function(err, res) {
            if (err) { return done(err); }
            request(context.app)
              .post('/events')
              .set('Authorization', 'Token ' + res.body.authToken)
              .send({'title': 'First example event'})
              .expect(201)
              .expect('Content-Type', /json/)
              .end(done);
          });
      });
      it('should create second example event', function(done) {
        request(context.app)
          .post('/signup')
          .send({'email': 'a2@example.com', 'password': 'sample'})
          .expect(200)
          .end(function(err, res) {
            if (err) { return done(err); }
            request(context.app)
              .post('/events')
              .set('Authorization', 'Token ' + res.body.authToken)
              .send({'title': 'Second example event'})
              .expect(201)
              .expect('Content-Type', /json/)
              .end(function(err, res){
                // defining ID for testing single event listing
                context.eventID = res.body.id;
                done();
              });
          });
      });
      it('should list event for second example event', function(done) {
        request(context.app)
          .get('/events/' + context.eventID)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            expect(res.body).to.be.an('object').and.to.have.property('title', 'Second example event');
            expect(res.body).to.have.property('id', context.eventID);
            done();
          });
      });
      it('should return 404 and error if eventID does not exist', function(done){
        request(context.app)
          .get('/events/' + 123456789123)
          .expect(404)
          .end(done);
      });
      it('should return 404 if ID is not 12 characters', function(done){
        request(context.app)
          .get('/events/' + 12345678912)
          .expect(404)
          .end(done);
      });
    });
  });
});
