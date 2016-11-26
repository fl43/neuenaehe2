var express = require('express')
var url = require('url')

var azureStorage = require('azure-storage')
var blobSvc = azureStorage.createBlobService()
var documentClient = require("documentdb").DocumentClient

var config = {};
config.endpoint = "https://neuenaehentt.documents.azure.com:443/"
config.primaryKey = "wSWrRxtVz8aXiuI9iy4lHNIe5Bi5pdWHYBciBqjYgjuR6oLtEQ9XurCGMKIWBHlWWVkgdSM7JSJ34uHtBBIhgw=="
	
var client = new documentClient(config.endpoint, { "masterKey": config.primaryKey })

var app = express()

app.get('/', function (req, res) {
	console.log('A new request arrived with HTTP headers: ' + JSON.stringify(req.headers));
	
	res.send('Hello World!')
})

app.post('/entry', function(req, res) {
	// saveEntry(req, res);
})

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port ' + process.env.PORT)
})
