var express = require('express');
var routes = require('./routes');

var MongoClient = require('mongodb').MongoClient;
// Connection URL for database

var url = ( process.env.MONGOLAB_URI || 'mongodb://localhost:27017/yoga' );

var ObjectID = require('mongodb').ObjectID;
var bcrypt = require('bcrypt');
var basicAuth = require('basic-auth');
var bodyParser = require('body-parser');

var crypto = require('crypto');

// *** Utilities ***
var clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

// replaces the "_id" attribute with "id"
// clone prevent function side effect
function formatEvent(event) {
  var e = clone(event);

  e.id = e._id;
  delete e._id;

  return e;
}

var formatUser = formatEvent;

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
        // authorization middleware
        var auth = function(req, res, next) {
          req = req.req || req;
          var authToken = req.headers.authorization;
          if (!authToken) return res.status(401).end();
          var parts = authToken.split(' ');
          if (parts[0].toLowerCase() !== 'token') return;
          if (!parts[1]) return;
          authToken = parts[1];
          usersCollection.findOne( { authToken: authToken }, function(err, user) {
            if (user) {
              req.user = user;
              next();
            } else {
              res.status(403).end();
            }
          });
        };

        // Read Events
        routes.events.readAll(app, formatEvent, eventsCollection);

        // Read Single Events
        routes.events.readSingle(app, ObjectID, eventsCollection, formatEvent);

        // Delete Event
        routes.events.delete(app, auth, ObjectID, eventsCollection);

        // Create Event
        routes.events.create(app, auth, createEvent, eventsCollection, formatEvent);

        // update event
        routes.events.update(app, auth, eventsCollection, ObjectID, formatEvent);

        app.use(function(err, req, res, next) {
          console.log(' error', err);
          if (err.message === 'Argument passed in must be a single String of 12 bytes or a string of 24 hex characters') {
            res.status(404).send(err);
          } else {
            res.status(500).send(err);
          }
        });


        // Get the users doc

        // Use node crypto to generate random bytes asyncronously
        var genToken = function(cb) {
          crypto.randomBytes(32, function(err, buffer) {
            if (err) {
              // set timout to allow for entropy to be generated
              setTimeout(function() { genToken(cb); }, 100);
            } else {
              // call the callback passing the buffer converted to string as an argument
              cb(null, buffer.toString('hex'));
            }
          });
        };

        // Generate token and TRY to insert user into collection
        // if error, try again recursively
        var insertUserWithToken = function(user, cb) {
          genToken(function(err, token) {
            // insert user into databse
            user.authToken = token;
            usersCollection.insert(user, function(err, result) {
              if (err) {
                insertUserWithToken(user, cb);
              } else {
                // call the callback passing the inserted user as an argument
                cb(null, result.ops[0]);
              }
            });
          });
        };


        // use an index for token generation to fix race condition bug
        // collection.ensureIndex("username", {unique: true}, callback)
        routes.users.create(app, validateEmail, bcrypt, usersCollection, insertUserWithToken);

        // Basic Auth Login
        app.get('/', function(req, res) {
          var basicAuthUser = basicAuth(req);
          if (!basicAuthUser) {
            res.status(403).end();
          } else {
            usersCollection.findOne( {email: basicAuthUser.name}, function(err, user) {
              if (!user) {
                res.status(403).end();
              } else {
                bcrypt.compare( basicAuthUser.pass, user.encryptedPassword, function(err, isSame) {
                  if (isSame) {
                    user = formatUser(user);
                    res.status(200).send({auth_token: user.authToken});
                  } else {
                    res.status(403).end();
                  }
                });
              }
            });
          }
        });

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
