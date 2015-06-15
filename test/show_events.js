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

  describe('Show events', function() {
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

    // beforeEach(createEvent('a2@example.com', 'Second'));
    describe('response', function() {
      context('no authentication required', function() {
        it('should list all events', function(done) {
          requestApp.r()
            .get('/events')
            .expect('Content-Type', /json/)
            .end(function(err, res) {
              if (err) { return done(err); }
              expect(res.body).to.be.an('array').to.have.length(2);
              expect(res.body[0]).to.have.deep.property('title', 'First example event');
              expect(res.body[1]).to.have.deep.property('title', 'Second example event');
              done();
            });
        });
      });
    });
  });
});
