var app = require('express')()
  // , API = require('json-api');

var mocks = require('./mocks');

var db = new mocks.Database();

app.get('/events', function(req, res){
	db.events().all(function(err, events) {
	  res.send(events);
	});
});

var server = app.listen(process.env.PORT || 3000);
