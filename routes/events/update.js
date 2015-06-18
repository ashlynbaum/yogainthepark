module.exports = function(app, auth, eventsCollection, ObjectID, formatEvent){
  app.patch('/events/:id', auth, function(req, res) {
    eventsCollection.findOne( { '_id': ObjectID(req.params.id) }, function(err, event) {
      var creatorID = event.creatorID;
      if (creatorID.equals(req.user._id)) {
        eventsCollection.findAndModify( { '_id': ObjectID(req.params.id) }, {}, {$set: req.body}, { new: true}, function(err, result) {
          res.status(200).send(formatEvent(result.value));
        });
      } else {
        res.status(403).end();
      }
    });
  });
}