var chai = require('chai');
var expect = chai.expect;
var databaseCleaner = require('./helpers/database_cleaner');
var requestAppWrapper = require('./helpers/request_app');

describe('basic auth login', function() {
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
      it('should recieve a 200 and user authentication token', function(done) {
        signupRequest()
          .expect(200)
          .end(function() {
            requestApp.r()
              .get('/')
              .auth('a@example.com', 'sample')
              .expect(200)
              .expect(/[a-f\d]{24}/)
              .end(done);
          });
      });
    });
    context('user does not exist in databse', function() {
      it('should recieve 403', function(done) {
        signupRequest()
          .expect(200)
          .end(function() {
            requestApp.r()
              .get('/')
              .auth('nonExistantUser@example.com', 'sample')
              .expect(403, done);
          });
      });
    });
    context('submitted password does not match with database', function(){
      it('should recieve a 403', function(done) {
        signupRequest()
          .expect(200)
          .end(function() {
            requestApp.r()
              .get('/')
              .auth('a@example.com', 'newpassword')
              .expect(403, done);
          });
      });
    });
  });
});
