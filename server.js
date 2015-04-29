var app = require('express')()

var MongoClient = require('mongodb').MongoClient
// Connection URL for database

var url = ( process.env.MONGOLAB_URI  || 'mongodb://localhost:27017/yoga' );

var ObjectID = require('mongodb').ObjectID;
var bcrypt = require('bcrypt');

var bodyParser = require('body-parser');

app.use(bodyParser.json());

// *** Utilities *** 
var clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// replaces the "_id" attribute with "id"
function formatEvent(event){
  // clone prevent function side effect
  var e = clone(event);

  e.id = e._id
  delete e._id

  return e;
};

var formatUser = formatEvent

var createEvent = function(attr){
  return {
    title: attr.title,
    creatorID: null
  }
};


function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {

    // Get the events doc
    var eventsCollection = db.collection('events')
    var usersCollection = db.collection('users')

    // authorization middleware
    var auth = function(req, res, next) {
      var authToken = req.get("X-Auth-Token")
      usersCollection.findOne( {"_id": ObjectID(authToken)}, function(err, user){
        if(user) {
          req.user = user;
          next()
        } else {
          res.status(403).end()
        }
      });
    }

    app.get('/events', function(req, res){
      eventsCollection.find({}).toArray(function(err, events) {

        // modify events to make rename each "_id" to "id"
        
        events = events.map(formatEvent)

        console.log('error', err)
        res.send(err || events);
      });
    });

    app.get('/events/:id', function(req, res, next) {
      var id = ObjectID(req.params.id)
      eventsCollection.findOne({ "_id" : id }, function(err, event) {
        if (event == null) return res.status(404).send(err);
        event2 = formatEvent(event);
        res.send(event2);
      });
    });

    // Delete Event
    app.delete('/events/:id', auth, function(req, res){
      eventsCollection.findOne( {"_id" : ObjectID(req.params.id)}, function(err, event){
        var creatorID = event.creatorID
        if (creatorID.equals(req.user._id)){
          eventsCollection.remove({ "_id" : ObjectID(req.params.id) }, function(){
            res.status(204).end();
          });
        } else {
          res.status(403).end()
        }
      });
    });

    // Create Event
    app.post('/events', auth, function(req, res){
      var eventObj = createEvent(req.body);
      eventObj.creatorID = req.user._id;
      eventsCollection.insert( eventObj, function(err, result) {
        var event = result.ops[0]
        res.status(201).send(formatEvent(event));
      });
    });

    // update event
    app.patch('/events/:id', auth, function(req, res){
      eventsCollection.findOne( { "_id" : ObjectID(req.params.id) }, function(err, event){
        var creatorID = event.creatorID;
        if (creatorID.equals(req.user._id)){
          eventsCollection.findAndModify( { "_id" : ObjectID(req.params.id) } , {}, {$set: req.body}, {new: true}, function(err, result){
            res.status(200).send(formatEvent(result.value));
          });
        } else {
          res.status(403).end()
        };
      });
    });

    app.use(function(err, req, res, next) {
      console.log(' error', err);
      res.status(404).send(err);
      next(err);

    });


    // Get the users doc
    // send random auth
    var rand = function() {
        return Math.random().toString(16).substr(2); //base 16 for hex and subtract 2 moves the decimal place
    };

    var genToken = function() {
        return rand() + rand() + rand() + rand(); // to make string 32 characters
    };

    function isTokenInDB(token, cb) {
      usersCollection.findOne( {authToken: token}, function(err, user) {
        cb(null, user && true)
      });
    };
    // check that token does not already exist
    function genUniqueToken(cb) {
      var token = genToken()
      isTokenInDB(token, function(err, result) {
        if (result) {
          return genUniqueToken(cb);
        } else{
          return cb(null, token);
        }
      });
    };

    app.post('/signup', function(req, res){
          var isEmail = validateEmail(req.body.email);
          if (!isEmail){
            res.status(422).send("Invalid email")
          } else {
            bcrypt.genSalt(10, function(err, salt) {
              bcrypt.hash(req.body.password, salt, function(err, hash) {
                usersCollection.findOne( {email: req.body.email}, function(err, user) {
                  if (!user){
                    genUniqueToken(function(err, uniqueToken) {
                      usersCollection.insert( {email: req.body.email, encryptedPassword: hash, authToken: uniqueToken}, function(err, result){
                        user = result.ops[0];
                        res.status(200).send("authToken is " + uniqueToken);
                      });
                    });
                  } else{
                    res.status(422).send("This user email already exists.")
                  }
                });
              });
            });
          }
        });


    app.post('/login', function(req, res){
      usersCollection.findOne( {email: req.body.email}, function(err, user){
        if (!user){
          res.status(403).end()
        } else {
          bcrypt.compare( req.body.password , user.encryptedPassword, function(err, isSame) {
            if (isSame){
              user = formatUser(user);
              res.status(200).send(user.id);
            } else{
              res.status(403).end()
            }
          });
        }
      });
    });

  }
});

var server = app.listen(process.env.PORT || 3000);
