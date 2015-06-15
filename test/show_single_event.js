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

  describe('show single event', function() {
    var authToken;
    var eventID;

    var createEvent = function(email, title, done) {
      requestApp.r()
        .post('/signup')
        .send({'email': email, 'password': 'sample'})
        .end(function(err, res) {
          if (err) { return done(err); }
          authToken = res.body.authToken;

          requestApp.r()
            .post('/events')
            .set('Authorization', 'Token ' + res.body.authToken)
            .send({'title': title + ' example event'})
            .end(function(err, eventResponse) {
              if (err) return done(err);

              eventID = eventResponse.body.id;
              done();
            });
        });
    };
    beforeEach(function(done) {
      createEvent('a@example.com', 'First', done);
    });
    beforeEach(function(done) {
      createEvent('a2@example.com', 'Second', done);
    });

    describe('response', function() {
      context('request second example event', function() {
        it('should list event', function(done) {
          requestApp.r()
            .get('/events/' + eventID)
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) { return done(); }
              expect(res.body).to.be.an('object').and.to.have.property('title', 'Second example event');
              expect(res.body).to.have.property('id', context.eventID);
              done();
            });
        });
      });
      context('event ID does not exist', function() {
        it('should return 404', function(done) {
          requestApp.r()
            .get('/events/' + 123456789123)
            .expect(404)
            .end(done);
        });
      });
      context('event ID is not 12 characters', function() {
        it('should return 404', function(done) {
          requestApp.r()
            .get('/events/' + 12345678912)
            .expect(404)
            .end(done);
        });
      });
    });
  });
});
