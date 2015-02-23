var express = require("express")

var app = express()

app.get('/hello/:name', function(req, res){
	console.log(req)
	res.send('Hello ' + req.params.name)
})

var server = app.listen(process.env.PORT || 3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})