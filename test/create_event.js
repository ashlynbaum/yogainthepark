var assert = require('chai').assert;
var request = require('supertest');
var server = require('../server');
var initApp = require('./helpers/init_db');

describe('Events', function() {
  var context = {};

  initApp.initDb(context);

  describe('GET /test', function() {
    it('should get 200 for test endpoint', function(done) {
      request(context.app)
        .get('/test')
        .expect(200)
        .end(done);
    });
  });

  describe('POST /events', function() {
    describe('when authorized', function() {
      var signupRequest = function() {
        return request(context.app)
          .post('/signup')
          .send({'email': 'a@example.com', 'password': 'sample'})
          .expect(200);
      };
      it('should return 201 and the formated event', function(done) {
        signupRequest()
          .end(function(err, res) {
            if (err) { return done(err); }
            request(context.app)
              .post('/events')
              .set('Authorization', 'Token ' + res.body.authToken)
              .send({'title': 'first example event'})
              .expect(201)
              .expect('Content-Type', /json/)
              .end(done);
          });
      });
    });
  });
});
