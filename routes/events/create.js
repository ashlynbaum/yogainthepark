module.exports = function(createEvent, eventsCollection, formatEvent){
 return function(req, res) {
  var eventObj = createEvent(req.body);
  eventObj.creatorID = req.user._id;
  eventsCollection.insert( eventObj, function(err, result) {
    var event = result.ops[0];
    res.status(201).send(formatEvent(event));
  });
  }
}