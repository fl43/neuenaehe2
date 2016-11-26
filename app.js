var express = require('express')
var url = require('url')

var azureStorage = require('azure-storage')

var storageConfig = {};
storageConfig.account = 'neuenaehentt'
storageConfig.key1 = 'Jhg+67Zv0wmrlUuLTDBOhru8kq25syPBQ0gegTfNHocQ0hZjFuyNtbpdxuieWFMVKIGMEQrhSEmno5pXDj4HlQ=='

var blobSvc = azureStorage.createBlobService(storageConfig.account, storageConfig.key1);
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
	saveEntry(req, res);
})

app.listen(process.env.PORT, function () {
  console.log('Example app listening on port ' + process.env.PORT)
})


function saveEntry(req, res) {
	var containerName = 'entries';

	blobSvc.createContainerIfNotExists(containerName, function(error, result, response){
		if (error) {
			console.log("Couldn't create container %s", containerName);
			console.error(err);
			
			res.status(500).send('Could not find or create container "' + containerName + '"!')
			
			return;
		} else {
			if (result) {
				console.log('Container %s created', containerName);
			} else {
				console.log('Container %s already exists', containerName);
			}
		}
	});
	
	var usr = req.param("user");
	var buf = new Buffer(req.param("img"), 'base64');
	var lat = req.param("lat");
	var lng = req.param("long");
	
	var fileName = 'place-' + lat + '-' + lng;
	
	blobSvc.createBlockBlobFromText(containerName, fileName, buf, function (error, result, response) {
		if(error){
            console.log("Couldn't not store file as text '" + fileName + "!");
            console.error(error);
			
			res.status(500).send('Could not store file as text "' + fileName + '"!')
        } else {
            console.log('String uploaded successfully');
        }
	});
	

	// "EntryDB"
	// "EntryCollection"
	// var HttpStatusCodes = { NOTFOUND: 404 };
	var collectionUrl = 'dbs/EntryDB/colls/EntryCollection';

	
	var document = {}
	document.filename = fileName
	document.user = usr
	document.lat = lat
	document.lng = lng
	document.timestamp = new Date().getMilliseconds

	documentClient.createDocument(collectionUrl, document, (err, created) => {
				if (err) {
					console.log("Couldn't not store document for '" + fileName + "!");
					console.error(error);

					res.status(500).send('Could not store document for "' + fileName + '"!')
				}
				else {
					console.log('Document saved successfully');
				}
		});

}
