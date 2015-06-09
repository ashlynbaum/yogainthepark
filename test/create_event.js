var initApp = require('./helpers/init_app');

describe('Events', function() {
  initApp.initDb();

  describe('GET /test', function() {
    it('should get 200 for test endpoint', function(done) {
      request(app)
        .get('/test')
        .expect(200)
        .end(done);
    });
  });


  describe('POST /events', function() {
    describe('when authorized', function() {
      var signupRequest = function() {
        return request(app)
          .post('/signup')
          .send({'email': 'a@example.com', 'password': 'sample'})
          .expect(200);
      };
      it('should return 201 and the formated event', function(done) {
        signupRequest()
          .end(function(err, res) {
            request(app)
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
