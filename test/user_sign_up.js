var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;
var databaseCleaner = require('./helpers/database_cleaner');
var requestAppWrapper = require('./helpers/request_app');

describe('user sign up', function() {
  var cleaner = databaseCleaner();

  before(cleaner.init);
  beforeEach(cleaner.clean);

  var requestApp = requestAppWrapper();

  before(requestApp.startApp);

  describe('response', function() {
    var signupRequest = function() {
      return requestApp.r()
        .post('/signup')
        .send({'email': 'a@example.com', 'password': 'sample'});
    };
    context('on success', function() {
      it('should recieve a 200 and authentication token', function(done) {
        signupRequest()
          .expect(200)
          .expect(function(res) {
            assert.match(res.body.authToken, /[a-f\d]{64}/);
          })
          .end(done);
      });
    });
    context('email already exists in database', function() {
      it('should recieve 422', function(done) {
        signupRequest()
          .expect(200)
          .end(function() {
            signupRequest()
              .expect(422)
              .end(done);
          });
      });
    });
    context('email does not have valid format', function() {
      it('should recieve 422', function(done) {
        requestApp.r()
          .post('/signup')
          .send({'email': 'aaaaaa.com', 'password': 'sample'})
          .expect(422)
          .expect('Invalid email')
          .end(done);
      });
    });
  });
});
