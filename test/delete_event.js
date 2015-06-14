var chai = require('chai');
var expect = chai.expect;
var request = require('supertest');
var server = require('../server');
var databaseCleaner = require('./helpers/database_cleaner');

describe('Events', function() {
  var cleaner = databaseCleaner();

  before(cleaner.init);
  beforeEach(cleaner.clean);

  var cont = {};

  before(function(done) {
    server.start(false, function(err, appStarted) {
      if (err) { return done(err); }
      cont.app = appStarted;
      done();
    });
  });


  describe('delete events', function() {
    var authToken;
    var eventID;

    var createEvent = function(done) {
      request(cont.app)
        .post('/signup')
        .send({'email': 'a@example.com', 'password': 'sample'})
        .end(function(err, res) {
          if (err) { return done(err); }
          authToken = res.body.authToken;

          request(cont.app)
            .post('/events')
            .set('Authorization', 'Token ' + res.body.authToken)
            .send({'title': 'First example event'})
            .end(function(err, eventResponse) {
              if (err) return done(err);

              eventID = eventResponse.body.id;
              done();
            });
        });
    };

    beforeEach(createEvent);

    describe('response', function() {
      var deleteRequest = function() {
        return request(cont.app)
          .delete('/events/' + eventID);
      };

      context('user not logged in', function() {
        it('should respond with a 401', function(done) {
          deleteRequest().expect(401).end(done);
        });
      });
      context('user not authorized', function () {
        it('should respond with a 403', function(done) {
          deleteRequest()
            // real creator id is 60675e9030a052c822d7ef000ef196fb21f5dc3c8fdaa8b5799562140baf20e9
            .set('Authorization', 'Token ' + '60675e9030a052c822d7ef000ef196fb21f5dc3c8fdaa8b5799562140baf20e1')
            .expect(403)
            .end(done);
        });
      });
      context('user is authorized', function() {
        it('should respond with 204 when event is deleted from database', function(done) {
          deleteRequest()
            .set('Authorization', 'Token ' + authToken)
            // .expect('Content-Type', /json/)
            .expect(204)
            .end(done);
        });
        describe('after delete', function() {
          beforeEach(function(done) {
            deleteRequest()
              .set('Authorization', 'Token ' + authToken)
              .end(done);
          });

          it('should not display event in list of events', function(done) {
            request(cont.app)
              .get('/events')
              .set('Authorization', 'Token ' + authToken)
              // .expect('Content-Type', /json/)
              .end(function(err, res) {
                if (err) { return done(err); }

                expect(res.body).to.be.an('array').to.have.length(0);
                done();
              });
          });
          it('should return 401 and error if eventID does not exist', function(done) {
            request(cont.app)
              .delete('/events/123456789123')
              .set('Authorization', 'Token ' + authToken)
              .expect(403)
              .end(done);
          });
        });
      });
    });
  });
});
