module.exports = function(app, ObjectID, eventsCollection, formatEvent) {
  app.get('/events/:id', function(req, res, next) {
    var id = ObjectID(req.params.id);
    eventsCollection.findOne({ '_id': id }, function(err, event) {
      if (event === null) return res.status(404).send(err);
      var event2 = formatEvent(event);
      res.send(event2);
    });
  });
}