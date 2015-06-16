var chai = require('chai');
var expect = chai.expect;
var databaseCleaner = require('./helpers/database_cleaner');
var requestAppWrapper = require('./helpers/request_app');

describe('Events', function() {
  var cleaner = databaseCleaner();

  before(cleaner.init);
  beforeEach(cleaner.clean);

  var requestApp = requestAppWrapper();

  before(requestApp.startApp);


  describe('delete events', function() {
    var authToken = {};
    var eventID = {};

    var createEvent = function(email, title, num, done) {
      requestApp.r()
        .post('/signup')
        .send({'email': email, 'password': 'sample'})
        .end(function(err, res) {
          if (err) { return done(err); }
          authToken[num] = res.body.authToken;

          requestApp.r()
            .post('/events')
            .set('Authorization', 'Token ' + res.body.authToken)
            .send({'title': title + ' example event'})
            .end(function(err, eventResponse) {
              if (err) return done(err);

              eventID[num] = eventResponse.body.id;
              done();
            });
        });
    };
    beforeEach(function(done) {
      createEvent('a@example.com', 'First', 1, done);
    });
    beforeEach(function(done) {
      createEvent('a2@example.com', 'Second', 2, done);
    });


    describe('response', function() {
      context('delete second example event', function() {
        var deleteRequest = function() {
          return requestApp.r()
            .delete('/events/' + eventID[2]);
        };

        context('user not logged in', function() {
          it('should respond with a 401', function(done) {
            deleteRequest()
            .expect(401)
            .end(done);
          });
        });
        context('user not authorized', function() {
          it('should respond with a 403', function(done) {
            deleteRequest()
              .set('Authorization', 'Token ' + authToken[1])
              .expect(403)
              .end(done);
          });
        });
        context('user is authorized', function() {
          it('should respond with 204 when event is deleted from database', function(done) {
            deleteRequest()
              .set('Authorization', 'Token ' + authToken[2])
              // .expect('Content-Type', /json/)
              .expect(204)
              .end(done);
          });
          describe('after delete', function() {
            beforeEach(function(done) {
              deleteRequest()
                .set('Authorization', 'Token ' + authToken[2])
                .end(done);
            });

            it('should not display event in list of events', function(done) {
              requestApp.r()
                .get('/events')
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                  if (err) { return done(err); }

                  expect(res.body).to.be.an('array').to.have.length(1);
                  done();
                });
            });
            it('should return 401 and error if eventID does not exist', function(done) {
              requestApp.r()
                .delete('/events/123456789123')
                .set('Authorization', 'Token ' + authToken[1])
                .expect(403)
                .end(done);
            });
          });
        });
      });
    });
  });
});
