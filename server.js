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


var app = express()
  .get('/api/weather/:city/:ts', weather.weather)
  .use('/api', middleware)
  .use('/public', express.static(__dirname + '/public'));


var port = Number(process.env.PORT || 8080);
http.createServer(app).listen(port);
console.log('Running at port '+port);
