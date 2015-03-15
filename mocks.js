var db = function Database() {};

db.prototype.events = function(cb) {
  cb(null, [
    { name: 'yoga in queens garden', latitude: -41.273816, longitude: 173.290008 },
    { name: 'yoga au park de l\'orangerie', latitude: 48.590904, longitude: 7.776133 }
  ]);
};

module.exports = {Database: db};
