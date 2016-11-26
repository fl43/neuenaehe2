var express = require('express')
var bodyParser = require('body-parser')
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
	
var docClient = new documentClient(config.endpoint, { "masterKey": config.primaryKey })

var app = express()

app.use(bodyParser.json());

app.get('/', function (req, res) {
	console.log('A new request arrived with HTTP headers: ' + JSON.stringify(req.headers));
	
	res.send('Hello World!')
})

app.get('/entries', function (req, res) {
	console.log('Request for entries: ' + JSON.stringify(req.query));

	var lat = req.query.lat
	var lng = req.query.lng
	var radius = req.query.radius

	var entries = []
	if (radius == '1') {
		entries.push({'lat': 52.53, 'lng':13.39, 'type':'Treppe ohne Rampe', 'comment':'Fehlende Rampe vor dem Eingang'});
		entries.push({'lat': 52.45, 'lng':13.31, 'type':'Bordstein nicht abgesenkt', 'comment':'Überquerung Unter den Linden problematisch'});
	}
	else if (radius == '2') {
		entries.push({'lat': 52.53, 'lng':13.39, 'type':'Treppe ohne Rampe', 'comment':'Fehlende Rampe vor dem Eingang'});
		entries.push({'lat': 52.45, 'lng':13.31, 'type':'Bordstein nicht abgesenkt', 'comment':'Überquerung Unter den Linden problematisch'});
		entries.push({'lat': 52.58, 'lng':13.52, 'type':'Ampel ohne Akustik', 'comment':'Das Klacken fehlt'});
	}
	res.send(JSON.stringify(entries))
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

/*
	console.log('params: %s', req.params);
	console.log('body: %s', req.body);
	console.log('type %s', typeof req.param("img"))
	console.log('param.user %s', req.params.user)
	*/
  console.log('body.user %s', req.body.user)
	// console.log('body.img %s', req.body.img)
	console.log('body.lat %s', req.body.lat)
	console.log('body.lng %s', req.body.lng)

	var imgStr = req.body.img
	console.log('typeof body.img %s', typeof imgStr)

	var usr = req.body.user;
	// var buf = Buffer.from(imgStr, 'base64');
	var lat = req.body.lat;
	var lng = req.body.lng;
	
	var fileName = 'place-' + lat + '-' + lng;
	
	blobSvc.createBlockBlobFromText(containerName, fileName, imgStr, {contentEncoding:'base64'}, function (error, result, response) {
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
	document.timestamp = new Date().getMilliseconds()

	docClient.createDocument(collectionUrl, document, function(err, created) {
				if (err) {
					console.log("Couldn't not store document for '" + fileName + "!");
					console.error(error);

					res.status(500).send('Could not store document for "' + fileName + '"!')
				}
				else {
					console.log('Document saved successfully');
				}
		});

		res.send("Success")
}
