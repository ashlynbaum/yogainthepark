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

MongoClient.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {

    // Get the events doc
    var eventsCollection = db.collection('events')

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

    app.delete('/events/:id', function(req, res){
      eventsCollection.remove({ "_id" : ObjectID(req.params.id) }, function(err, event){
        res.status(204).end();
      });
    });

    app.post('/events', function(req, res){
      eventsCollection.insert( req.body, function(err, result) {
        var event = result.ops[0]
        res.status(201).send(formatEvent(event));
      });
    });

    app.patch('/events/:id', function(req, res){
      eventsCollection.findAndModify( { "_id" : ObjectID(req.params.id) } , {}, {$set: req.body}, {new: true}, function(err, result){
        res.status(200).send(formatEvent(result.value));
      });
    });

    app.use(function(err, req, res, next) {
      console.log(' error', err);
      res.status(404).send(err);
      next(err);

    });


    // Get the users doc
    var usersCollection = db.collection('users')

    app.post('/signup', function(req, res){
      bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
          usersCollection.findOne( {email: req.body.email}, function(err, user) {
            if (!user){
              usersCollection.insert( {email: req.body.email, encryptedPassword: hash}, function(err, result){
                user = result.ops[0];
                res.status(200).send(formatUser(user).id);
              });
            } else{
              res.status(422).send("This user email already exists.")
            }
          });
        });
      });
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
