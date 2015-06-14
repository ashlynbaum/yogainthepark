var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var should = chai.should();
var request = require('supertest');
var server = require('../server');
var initApp = require('./helpers/init_db');

describe('Events', function() {
  var context = {};

  initApp.initDb(context);

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
              .end( function(err, res) {
                if (err) { return done(err) }
                expect(res.body).to.be.an('object').and.to.have.property('title', 'first example event');
                done();
              });
          });
      });
    });
    describe('when not authorized', function() {
      it('should return 401 unauthorized', function(done) {
        request(context.app)
          .post('/events')
          .expect(401)
          .end(done);
      });
    });
  });
});
