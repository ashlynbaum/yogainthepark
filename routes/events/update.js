var ObjectID = require('mongodb').ObjectID;
var helpers = require('../../helpers');

module.exports = function(eventsCollection){
  return function(req, res) {
    eventsCollection.findOne( { '_id': ObjectID(req.params.id) }, function(err, event) {
      var creatorID = event.creatorID;
      if (creatorID.equals(req.user._id)) {
        eventsCollection.findAndModify( { '_id': ObjectID(req.params.id) }, {}, {$set: req.body}, { new: true}, function(err, result) {
          res.status(200).send(helpers.formatEvent(result.value));
        });
      } else {
        res.status(403).end();
      }
    });
  }
}