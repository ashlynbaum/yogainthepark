# yogainthepark
  [![Linux Build][travis-image]][travis-url]

##Development Environment
###Start server
`$ node sever.js`
or use nodemon to automatically reload server
`$ node_modules/.bin/nodemon server.js`

###Start mongodb
`$mongod`

### Run testing
Development testing is written in mocha, using supertest and chai

run tests:
`$./node_modules/.bin/mocha test`

[travis-image]: https://img.shields.io/travis/ashlynbaum/yogainthepark/master.svg?label=linux
[travis-url]: https://travis-ci.org/ashlynbaum/yogainthepark
