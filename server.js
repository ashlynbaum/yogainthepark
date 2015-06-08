var express = require('express');

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
          if (!auth) return;
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

        app.get('/events', function(req, res) {
          eventsCollection.find({}).toArray(function(err, events) {
            // modify events to make rename each "_id" to "id"
            events = events.map(formatEvent);
            res.send(err || events);
          });
        });

        app.get('/events/:id', function(req, res, next) {
          var id = ObjectID(req.params.id);
          eventsCollection.findOne({ '_id': id }, function(err, event) {
            if (event === null) return res.status(404).send(err);
            var event2 = formatEvent(event);
            res.send(event2);
          });
        });

        // Delete Event
        app.delete('/events/:id', auth, function(req, res) {
          eventsCollection.findOne({ '_id': ObjectID(req.params.id) }, function(err, event) {
            var creatorID = event.creatorID;
            if (creatorID.equals(req.user._id)) {
              eventsCollection.remove({ '_id': ObjectID(req.params.id) }, function() {
                res.status(204).end();
              });
            } else {
              res.status(403).end();
            }
          });
        });

        // Create Event
        app.post('/events', auth, function(req, res) {
          var eventObj = createEvent(req.body);
          eventObj.creatorID = req.user._id;
          eventsCollection.insert( eventObj, function(err, result) {
            var event = result.ops[0];
            res.status(201).send(formatEvent(event));
          });
        });

        // update event
        app.patch('/events/:id', auth, function(req, res) {
          eventsCollection.findOne( { '_id': ObjectID(req.params.id) }, function(err, event) {
            var creatorID = event.creatorID;
            if (creatorID.equals(req.user._id)) {
              eventsCollection.findAndModify( { '_id': ObjectID(req.params.id) }, {}, {$set: req.body}, { new: true}, function(err, result) {
                res.status(200).send(formatEvent(result.value));
              });
            } else {
              res.status(403).end();
            }
          });
        });

        app.use(function(err, req, res, next) {
          console.log(' error', err);
          res.status(404).send(err);
          next(err);
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
        app.post('/signup', function(req, res){
          var isEmail = validateEmail(req.body.email);
          if (!isEmail) {
            res.status(422).send('Invalid email');
          } else {
            bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(req.body.password, salt, function(err, hash) {
                usersCollection.findOne({email: req.body.email}, function(err, user) {
                  if (!user) {
                    user = {email: req.body.email, encryptedPassword: hash};
                    insertUserWithToken(user, function(err, user) {
                      res.status(200).send('authToken is ' + user.authToken);
                    });
                  } else {
                    res.status(422).send('This user email already exists.');
                  }
                });
              });
            });
          }
        });

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

        app.get('/test', function(req, res) {
          return res.status(200).end();
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
