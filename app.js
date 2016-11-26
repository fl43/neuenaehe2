var express = require('express')
var app = express()

app.get('/', function (req, res) {
	console.log('A new request arrived with HTTP headers: ' + JSON.stringify(req.headers));
	
	res.send('Hello World!')
})

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port ' + process.env.PORT)
})
