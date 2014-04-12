var express = require('express');
var http = require('http');
var url = require('url');
var fs = require('fs');
var request = require('request');
var weather = require('./lib/weather');

var middleware = function(req, res) {
  //var pathname = url.parse(req.url).pathname;
  //res.type('application/json; charset=utf-8').sendfile('data'+pathname+'.json');
};


// var url = require('url');
var restify = require('express-restify-mongoose');
var mongoose = require('mongoose');

var Artist = require('./api/models/artist');
var Faq = require('./api/models/faq');
var News = require('./api/models/news');
var Program = require('./api/models/program');
var Stage = require('./api/models/stage');

var mongourl = process.env.MONGOLAB_URI || 'mongodb://localhost/festapp-dev';
mongoose.connect(mongourl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('Yay');
});

var app = express();
app.get('/api/weather/:city/:ts?', weather.weather);
app.use('/api', middleware);
app.use('/public', express.static(__dirname + '/public'));

restify.serve(app, Artist);
restify.serve(app, Faq);
restify.serve(app, News);
restify.serve(app, Program);
restify.serve(app, Stage);

var port = Number(process.env.PORT || 8080);
http.createServer(app).listen(port);
console.log('Running at port '+port);
