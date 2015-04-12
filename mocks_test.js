var mocks = require('./mocks');

var db = new mocks.Database();

console.log('List all events')
db.events().all(function(err, events) {
  console.log(JSON.stringify(events));
});

console.log('find and event')
db.events().find(0, function(err, event) {
  console.log(JSON.stringify(event));
})

console.log('create an event')
db.events().insert({name: "event"}, function(err, event) {
  console.log(JSON.stringify(event));
})
