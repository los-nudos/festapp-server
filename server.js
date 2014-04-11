var express = require('express');
var http = require('http');
var url = require('url');
var fs = require('fs');

var middleware = function(req, res) {
  var pathname = url.parse(req.url).pathname;
  res.type('application/json; charset=utf-8').sendfile('data'+pathname+'.json');
};

// api/weather/?ts=1397271600
var weather = function(req, res) {
  function getSimpleWeather(weatherData) {
    return "SUPER FUCKING HOT";
  }
  var pathname = url.parse(req.url).pathname;
  var ts = parseInt(req.param('ts'));
  var fileContents = fs.readFileSync('/Users/jw/work/festapp-server/data/weather_celsius.json');

  console.log(fileContents);
  var data = JSON.parse(fileContents);
  var closest = { delta: Number.MAX_VALUE, weather: null};
  for (var idx in data.list) {
    var item = data.list[idx];
    console.log(item);
    var delta = Math.abs(ts - item.dt);
    if (delta < closest.delta) {
      closest.delta = delta;
      closest.weather = {
        temp: item.main.temp,
        weather: getSimpleWeather(item.weather)
      }
    }
  };

  res.type('application/json; charset=utf-8').end(JSON.stringify(closest.weather));
}


var app = express()
  .get('/api/weather/:ts', weather)
  .use('/api', middleware)
  .use('/public', express.static(__dirname + '/public'));

var port = Number(process.env.PORT || 8080);
http.createServer(app).listen(port);
console.log('Running at port '+port);
