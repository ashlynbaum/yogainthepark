module.exports = function(app, auth, ObjectID, eventsCollection) {
  app.delete('/events/:id', auth, function(req, res) {
    eventsCollection.findOne({ '_id': ObjectID(req.params.id) }, function(err, event) {
      if (event && event.creatorID.equals(req.user._id)) {
        eventsCollection.remove({ '_id': ObjectID(req.params.id) }, function() {
          res.status(204).end();
        });
      } else {
        res.status(403).end();
      }
    });
  });
}
