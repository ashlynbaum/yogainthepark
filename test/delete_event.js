var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var request = require('supertest');
var server = require('../server');

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

  describe('delete /events/:id', function() {
    describe('delete events', function() {
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
            // Define user authentication token for event creator
            context.userAuthToken = res.body.authToken;
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
      it('should respond with a 401 if user is not logged in', function(done) {
        request(context.app)
          .delete('/events/' + context.eventID)
          .expect(401)
          .end(done);
      });
      it('should respond with a 403 if user ID does not match event creator ID', function(done) {
        request(context.app)
          .delete('/events/' + context.eventID)
          // real creator id is 60675e9030a052c822d7ef000ef196fb21f5dc3c8fdaa8b5799562140baf20e9
          .set('Authorization', 'Token ' + '60675e9030a052c822d7ef000ef196fb21f5dc3c8fdaa8b5799562140baf20e1')
          .expect(403)
          .end(done);
      });
      it('should respond with 204 when event is deleted from database', function(done) {
        request(context.app)
          .delete('/events/' + context.eventID)
          .set('Authorization', 'Token ' + context.userAuthToken)
          .expect('Content-Type', /json/)
          .expect(204)
          .end(function(err, res) {
            done();
          });
      });
      it('should not display event in list of events', function(done) {
        request(context.app)
          .get('/events')
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            if (err) { return done(err); }
            expect(res.body).to.be.an('array').to.have.length(1);
            expect(res.body[0]).to.have.deep.property('title', 'First example event');
            done();
          });
      });
      it('should return 401 and error if eventID does not exist', function(done){
        request(context.app)
          .delete('/events/' + 123456789123)
          .expect(401)
          .end(done);
      });
    });
  });
});
