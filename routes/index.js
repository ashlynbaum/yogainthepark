module.exports = {
  users: {
    create: require('./users/create'),
    read: require('./users/read')
  },
  events: {
    create: require('./events/create'),
    update: require('./events/update'),
    readAll: require('./events/read_all'),
    readSingle: require('./events/read_single'),
    delete: require('./events/delete')
   }
 };