var ObjectID = require('mongodb').ObjectID;

module.exports = function(db) {
  var eventsCollection = db.collection('events');
  return function(req, res) {
    eventsCollection.findOne({ '_id': ObjectID(req.params.id) }, function(err, event) {
      if (event && event.creatorID.equals(req.user._id)) {
        eventsCollection.remove({ '_id': ObjectID(req.params.id) }, function() {
          res.status(204).end();
        });
      } else {
        res.status(403).end();
      }
    });
  }
}
