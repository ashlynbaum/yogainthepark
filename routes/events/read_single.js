var ObjectID = require('mongodb').ObjectID;
var helpers = require('../../helpers');

module.exports = function(eventsCollection) {
  return function(req, res, next) {
    var id = ObjectID(req.params.id);
    eventsCollection.findOne({ '_id': id }, function(err, event) {
      if (event === null) return res.status(404).send(err);
      var event2 = helpers.formatEvent(event);
      res.send(event2);
    });
  }
}