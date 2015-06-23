var helpers = require('../../helpers');

module.exports = function(db) {
  var eventsCollection = db.collection('events');
  return function(req, res) {
    eventsCollection.find({}).toArray(function(err, events) {
      // modify events to make rename each "_id" to "id"
      events = events.map(helpers.formatEvent);
      res.send(err || events);
    });
  }
}