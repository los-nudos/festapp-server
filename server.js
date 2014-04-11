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
    var weatherId = weatherData[0].id;
    var simpleWeather = openWeatherToSimpleWeather(weatherId);
    return simpleWeatherTypes[simpleWeather];
  }

  function openWeatherToSimpleWeather(weatherId) {
    var simpleWeather;
    if((weatherId >= 200 && weatherId < 300) || (weatherId >= 900 && weatherId <= 902) || (weatherId >= 957 && weatherId <= 962))
      simpleWeather = 7;
    else if(weatherId >= 300 && weatherId <= 500)
      simpleWeather = 4;
    else if(weatherId == 501 || weatherId == 502)
      simpleWeather = 5;
    else if(weatherId >= 502 && weatherId <= 522)
      simpleWeather = 6;
    else if(weatherId >= 600 && weatherId <= 621)
      simpleWeather = 8;
    else if(weatherId >= 701 && weatherId <= 741)
      simpleWeather = 9;
    else if(weatherId == 800)
      simpleWeather = 1;
    else if(weatherId == 801 || weatherId == 802)
      simpleWeather = 2;
    else if(weatherId == 803 || weatherId == 804)
      simpleWeather = 3;
    return simpleWeather;
  }

  var simpleWeatherTypes = {
    1: 'sunny',
    2: 'parly cloudy',
    3: 'cloudy',
    4: 'light rain',
    5: 'rain',
    6: 'heavy rain',
    7: 'storm',
    8: 'snow',
    9: 'fog'
  }

  var pathname = url.parse(req.url).pathname;
  var ts = parseInt(req.param('ts'));
  var fileContents = fs.readFileSync('data/weather_celsius.json');

  //console.log(fileContents);
  var data = JSON.parse(fileContents);
  var closest = { delta: Number.MAX_VALUE, weather: null};
  for (var idx in data.list) {
    var item = data.list[idx];
    //console.log("-----------------------------------asd")
    //console.log(item);
    var delta = Math.abs(ts - item.dt);
    if (delta < closest.delta) {
      //console.log("hei")
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
