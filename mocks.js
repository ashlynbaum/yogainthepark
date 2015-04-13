var crypto = require('crypto');

var db = function Database() {};

var fakeEvent = {
  "id": "507f1f77bcf86cd799439011",
  "title":"event name",
  "description":"event description",
  "location":{
    "position":{
      "lat": -41.299553,
      "lon": 174.768181
    },
    "name":"Central Park",
    "city":"Wellington",
    "country":"NZ"
  },
  "event_start_time":"2015-03-26T23:20:32Z",
  "event_end_time":"2015-03-26T23:40:32Z",
  "imgs":[
    "https://gebarbieri.files.wordpress.com/2014/03/barefoot-in-the-park-yoga-6-25-09-45.jpg?w=599",
    "https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRKMgybw0vsuK_GMwCw0UUM30fQgRpRgkgIeNZMGnxt1rX8glnPog"
  ]
};

var eventCollection = {
  all: function(cb) { cb(null, [fakeEvent]); },
  find: function(id, cb) {
    var eventCopy = JSON.parse(JSON.stringify(fakeEvent));
    eventCopy.id = id;
    cb(null, eventCopy)
  },
  insert: function(event, cb) {
    event.id = crypto.randomBytes(20).toString('hex');
    cb(null, event);
  },
  destroy: function(id, cb) {
    var eventCopy = JSON.parse(JSON.stringify(fakeEvent));
    eventCopy.id = id;
    cb(null, eventCopy);
  }
};

db.prototype.events = function() { return eventCollection };

module.exports = {Database: db};
