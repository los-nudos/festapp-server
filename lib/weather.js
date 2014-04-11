var request = require('request');
var cache = require('memory-cache');

function getSimpleWeather(weatherData) {
      var weatherId = weatherData[0].id;
      var simpleWeather = openWeatherToSimpleWeather(weatherId);
      return simpleWeatherTypes[simpleWeather];
    }

function openWeatherToSimpleWeather(weatherId) {
  var simpleWeather;
  if((weatherId >= 200 && weatherId < 300) || 
     (weatherId >= 900 && weatherId <= 902) || 
     (weatherId >= 957 && weatherId <= 962))
    return 7;
  else if(weatherId >= 300 && weatherId <= 500)
    return 4;
  else if(weatherId == 501 || weatherId == 502)
    return 5;
  else if(weatherId >= 502 && weatherId <= 522)
    return 6;
  else if(weatherId >= 600 && weatherId <= 621)
    return 8;
  else if(weatherId >= 701 && weatherId <= 741)
    return 9;
  else if(weatherId == 800)
    return 1;
  else if(weatherId == 801 || weatherId == 802)
    return 2;
  else if(weatherId == 803 || weatherId == 804)
    return 3;
  return 0;
}

var simpleWeatherTypes = {
  0: 'error',
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

function closestForecast(data, ts){
  var closest = { delta: Number.MAX_VALUE, weather: null};

  for (var idx in data.list) {
    var item = data.list[idx];
    var delta = Math.abs(ts - item.dt);
    if (delta < closest.delta) {
      closest.delta = delta;
      closest.weather = {
        temp: item.main.temp,
        weather: getSimpleWeather(item.weather)
      }
    }
    return closest;
  }
}




module.exports = {

  weather: function(req, res) {

    var pathname = req.url;
    var ts = req.url.split('/');
    var city = ts[ts.length-2];
    ts = parseInt(ts[ts.length-1]);


    var cached = cache.get(city)
    if(cached){
      var closest = closestForecast(cached, ts);
      res.type('application/json; charset=utf-8').end(JSON.stringify(closest.weather));
    } else {
      var url = ['http://api.openweathermap.org/data/2.5/forecast?q=', city, '&mode=json&units=metric'].join('');

      request(url, function (error, response, body) {      
        var closest = {"weather": "error"};

        var data = JSON.parse(body);
        if (!error && data.cod == 200) {
          closest = closestForecast(data, ts);
          cache.put(city, data, 1000*3600)
        } 
        res.type('application/json; charset=utf-8').end(JSON.stringify(closest.weather));
      }); 
    }

  }
}
  

    
  