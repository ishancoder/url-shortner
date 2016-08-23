var express = require('express');
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var app = express()

var urlRe = /.*\..*\..*/;
var BASE_URL = "http://localhost:8080"
var dbUrl = "mongodb://localhost:27017/shorthub";
var collectionName = "urls";

var generateUrl = function generateUrl(_id){return BASE_URL + '/g/' + _id;};

app.get('/', function(req, res){
	res.send("<h1>How're you doin??</h1>");
});

app.get('/g/:id', function(req, res){
	var id = req.params.id;

	console.log(id);

	mongo.connect(dbUrl, function(err, db){
		if(err)
			throw err;
		var urls = db.collection(collectionName);
		urls.findOne({
			_id: new ObjectId(id)
		}, function(err, data){
			if(err)
				throw err;
			if(data != null){
				res.redirect('http://' + data.original_url);
			}
		});
		db.close();
	});
});

app.get(['/short/:url','/short/http(s)?://:url'], function(req, res){
	var url = req.params.url;
	if(url.match(urlRe)){
		var obj = {original_url: url};

		mongo.connect(dbUrl, function(err, db){
			if(err)
				throw err;

			var urls = db.collection(collectionName);

			urls.insert(obj, function(err, ids){
				if(err)
					throw err;
				//get the id of currently inserted element
				var id = ids.insertedIds[0];
				res.json({
					original_url: url,
					short_url: generateUrl(id)
				});
			});

			db.close();
		});
	} else {
		res.json({
			original_url: url,
			short_url: null
		});
	}
});

app.listen(8080, function(){
	console.log("Listening on PORT 8080");
});