var assert = require('chai').assert, expect = require('chai').expect;
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

describe('users authentication', function(){
  describe('GET /test',function(){
    it('should get 200 for test endpoint', function(done){
      request(app)
        .get('/test')
        .expect(200)
        .end(done)
    })
  })
  describe('POST /login',function(){
    var signupRequest = function() {
      return request(app)
        .post('/signup')
        .send({"email": "a@example.com", "password": "sample"});
    };
    it('should recieve a 200 and user id', function(done){
      signupRequest()
        .expect(200)
        .end(function(){
          request(app)
            .post('/login')
            .send({"email": "a@example.com", "password": "sample"})
            .expect(200)
            .expect(/[a-f\d]{24}/)
            .end(done)
        })
    })
    it('should recieve a 403 if user does not exist', function(done){
      signupRequest()
        .expect(200)
        .end(function(){
          request(app)
            .post('/login')
            .send({"email": "newUser@example.com", "password": "sample"})
            .expect(403,done)
        })
    })

    it('should recieve a 402 and user password does not match', function(done){
      signupRequest()
        .expect(200)
        .end(function(){
          request(app)
            .post('/login')
            .send({"email": "a@example.com", "password": "newpassword"})
            .expect(403,done)
        })
    })
  })
})
