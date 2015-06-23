var helpers = require('../../helpers');

module.exports = function(db){
  var eventsCollection = db.collection('events');
  var createEvent = helpers.createEvent;
  return function(req, res) {
    var eventObj = createEvent(req.body);
    eventObj.creatorID = req.user._id;
    eventsCollection.insert( eventObj, function(err, result) {
      var event = result.ops[0];
      res.status(201).send(helpers.formatEvent(event));
    });
  }
}