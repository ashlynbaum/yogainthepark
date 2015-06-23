var clone = require('./clone');

// replaces the "_id" attribute with "id"
// clone prevent function side effect
module.exports = function(event) {
    var e = clone(event);

    e.id = e._id;
    delete e._id;

    return e;
  }