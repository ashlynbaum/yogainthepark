var assert = require('assert');
var request = require('supertest');
var app = require('../server');

before(function(done) {
  app.on('ready', done);

});

var db
// define database
before(function(done){
 var MongoClient = require('mongodb').MongoClient
 // Connection URL for database
 var url = ( process.env.MONGOLAB_URI  || 'mongodb://localhost:27017/yoga' );
 // hook to database before each hook
 MongoClient.connect(url, function (err, database) {
  db = database;
  done();
 })
})


beforeEach(function(done) {
  db.dropDatabase(function(){
    done();
  })
})

describe('authentication of users', function(){
  describe('GET /test',function(){
    it('should get 200 for test endpoint', function(done){
      request(app)
      // visit "/test"
        .get('/test')
        .expect(200)
        .end(done)
    })
  })
  describe('POST /signup',function(){
    var signupRequest = function() {
      return request(app)
        .post('/signup')
        .send({"email": "a@example.com", "password": "sample"});
    };
    it('should recieve a 200 and authentication token', function(done){
      signupRequest()
        .expect(200)
        .expect(/^authToken is [a-f\d]{64}$/)
        .end(done)
      // Send username and password
      // recieve '200'
      // recieve authorization token
      // remove username from database
    })

    it('should recieve a 422 when emails already exists in database', function(done){
      signupRequest()
        .expect(200)
        .end(function(){
          signupRequest()
            .expect(422)
            .end(done)
        })
    })
  })
})

//     it('should fail if username already exists', function(done){
//       request(app)
//       // visit "/signup"
//       // send username & password
//       // refresh database
//       // send same username
//       // receive err
//     })
//     it('should fail if username is not an email'), function(done){
//       request(app)
//       // visit "/signup"
//       // send username & password thats not an email
//       // recieve err
//     })
//   })
// })