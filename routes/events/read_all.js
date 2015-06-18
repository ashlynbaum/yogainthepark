module.exports = function(app, formatEvent, eventsCollection) {
  app.get('/events', function(req, res) {
    eventsCollection.find({}).toArray(function(err, events) {
      // modify events to make rename each "_id" to "id"
      events = events.map(formatEvent);
      res.send(err || events);
    });
  });
}