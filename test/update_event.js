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

  describe('update events', function() {
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
      context('if user is not logged in', function(){
        it('should respond with 401', function(done) {
          requestApp.r()
            .patch('/events/' + eventID)
            .expect(401)
            .end(done);
        });
      });
      context('if user ID does not match event creator ID', function() {
        it('should respond with 403', function(done) {
          requestApp.r()
            .patch('/events/' + eventID[2])
            // for event 2, with auth of event 1
            .set('Authorization', 'Token ' + authToken[1])
            .expect(403)
            .end(done);
        });
      });
      context('on success update of second event', function() {
        it('should respond with 200 and updated event', function(done) {
          requestApp.r()
            .patch('/events/' + eventID[2])
            .set('Authorization', 'Token ' + authToken[2])
            .send({'title': 'Updated event title'})
            .expect('Content-Type', /json/)
            .expect(200)
            .end(function(err, res) {
              if (err) { return done(); }
              expect(res.body).to.be.an('object').and.to.have.property('title', 'Updated event title');
              done();
            });
        });
      });
      context('event ID does not exist', function() {
        it('should return 401 and error if eventID does not exist', function(done) {
          requestApp.r()
            .patch('/events/' + 123456789123)
            .expect(401)
            .end(done);
        });
      });
    });
  });
});
