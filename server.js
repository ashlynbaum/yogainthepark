var express = require('express');
var routes = require('./routes');

var MongoClient = require('mongodb').MongoClient;
// Connection URL for database

var url = ( process.env.MONGOLAB_URI || 'mongodb://localhost:27017/yoga' );

var ObjectID = require('mongodb').ObjectID;
var bcrypt = require('bcrypt');
var basicAuth = require('basic-auth');
var bodyParser = require('body-parser');


var middleware = require('./middleware');


var createEvent = function(attr) {
  return {
    title: attr.title,
    creatorID: null
  };
};


var validateEmail = function validateEmail(email) {
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
};

/*
 * upgrade to https
 * for api use only
 * for redirection
 * return res.redirect('https://' + req.headers.host + req.url);
 */
var requireHTTPS = function(req, res, next) {
  if (req.get('X-Forwarded-Proto') === 'http') {
    return res.status(426).end();
  }
  next();
};


module.exports.start = function(shouldListen, callback) {
  var app = express();
  app.use(bodyParser.json());


// only active on heroku
/*
 app.get('env') will check the environment variable NODE_ENV
 if not defined: it will automatically be define as development
 NODE_ENV = "production" is set as an environment variable in Heroku
*/
  if (app.get('env') === 'production') app.use(requireHTTPS);


  MongoClient.connect(url, function(err, db) {
    if (err) {
      console.log('Unable to connect to the mongoDB server. Error:', err);
    } else {
      var eventsCollection = db.collection('events');
      var usersCollection = db.collection('users');

      // Index user collection in assending order of authorization token
      usersCollection.ensureIndex({'authToken': 1}, {unique: true}, function(err, created) {
        if (err) {
          throw new Error('Unable to ensure authToken index.');
        }

        // Read Events
        app.get('/events', routes.events.readAll(eventsCollection));


        // Read Single Events
        app.get('/events/:id', routes.events.readSingle(eventsCollection));

        // Delete Event
        app.delete('/events/:id', middleware.auth(db), routes.events.delete(eventsCollection));

        // Create Event
        app.post('/events', middleware.auth(db), routes.events.create(createEvent, eventsCollection));

        // update event
        app.patch('/events/:id', middleware.auth(db), routes.events.update(eventsCollection));

        app.use(function(err, req, res, next) {
          console.log(' error', err);
          if (err.message === 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters') {
            res.status(404).send(err);
          } else {
            res.status(500).send(err);
          }
        });


        // Get the users doc

        // use an index for token generation to fix race condition bug
        // collection.ensureIndex("username", {unique: true}, callback)
        app.post('/signup', routes.users.create(db, validateEmail, bcrypt));

        // Basic Auth Login
        app.get('/', routes.users.read(basicAuth, bcrypt, usersCollection));

        if (shouldListen) {
          var port = process.env.PORT || 3000;
          app.listen(port, function(err) {
            if (err) { console.error(err); }
            console.log('server listening on ' + port);
          });
        }
        callback(null, app);
      });
    }
  });

// app.on(function(eventName, callback) {
//   if(eventName === 'ready') app.readyCallback = callback;
// })
};

if(require.main === module) {
  module.exports.start(true, function() {
    console.log('App is connected to database, index is present.');
  });
}
