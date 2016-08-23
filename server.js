var express = require('express');
var mongo = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var validUrl = require('valid-url');
var app = express()

var BASE_URL = "http://localhost:8080"
var dbUrl = "mongodb://localhost:27017/shorthub";
var collectionName = "urls";

var generateUrl = function generateUrl(){
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for(var i=0; i < 7; i++){
		text += possible.charAt(Math.random() * possible.length);
	}

	return BASE_URL + '/' + text;
};

app.use(express.static('views'));

app.get('/:id', function(req, res){
	var id = req.params.id;

	mongo.connect(dbUrl, function(err, db){
		if(err)
			throw err;
		var urls = db.collection(collectionName);
		urls.findOne({
			short_url: BASE_URL + "/" + id
		}, function(err, data){
			if(err)
				throw err;
			if(data != null){
				if(data.original_url.startsWith("http") || data.original_url.startsWith("https")){
					res.redirect(data.original_url);
				} else {
					res.redirect("http://" + data.original_url)
				}
			}
		});
		db.close();
	});
});

app.get('/short/*', function(req, res){
	var url = req.path.split('/short/')[1];

	if(validUrl.isWebUri("http://"+url)){

		mongo.connect(dbUrl, function(err, db){
			if(err)
				throw err;

			var urls = db.collection(collectionName);

			var shortUrl = generateUrl();
			var obj = {original_url: url, short_url: shortUrl};
			urls.insert(obj, function(err, ids){
				if(err)
					throw err;
				//get the id of currently inserted element
				var id = ids.insertedIds[0];
				res.json({
					original_url: url,
					short_url: shortUrl
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