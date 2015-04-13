var app = require('express')()
  // , API = require('json-api');

var mocks = require('./mocks');

var db = new mocks.Database();

var bodyParser = require('body-parser');

app.use(bodyParser.json());

app.get('/events', function(req, res){
  db.events().all(function(err, events) {
    res.send(events);
  });
});

app.get('/events/:id', function(req, res){
  db.events().find(req.params.id, function(err, event) {
    res.send(event);
  });
});

app.post('/events', function(req, res){
  db.events().insert( req.body, function(err, events) {
    res.status(201).send(req.body);
  });
});

var server = app.listen(process.env.PORT || 3000);
