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

  describe('create event', function() {
    context('when authorized', function() {
      var signupRequest = function() {
        return requestApp.r()
          .post('/signup')
          .send({'email': 'a@example.com', 'password': 'sample'})
          .expect(200);
      };
      it('should return 201 and the formated event', function(done) {
        signupRequest()
          .end(function(err, res) {
            if (err) { return done(err); }
            requestApp.r()
              .post('/events')
              .set('Authorization', 'Token ' + res.body.authToken)
              .send({'title': 'first example event'})
              .expect(201)
              .expect('Content-Type', /json/)
              .end( function(err, res) {
                if (err) { return done(err); }
                expect(res.body).to.be.an('object').and.to.have.property('title', 'first example event');
                done();
              });
          });
      });
    });
    context('when not authorized', function() {
      it('should return 401 unauthorized', function(done) {
        requestApp.r()
          .post('/events')
          .expect(401)
          .end(done);
      });
    });
  });
});
