var express = require('express');
var http = require('http');
var url = require('url');
var restify = require('express-restify-mongoose');
var mongoose = require('mongoose');
var logger = require('morgan');
var url = require('url');
var after = require('after');
var redis = require('redis-url').connect(process.env.REDISCLOUD_URL);
var bodyParser = require('body-parser');

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
});

redis.on('error', function (err) {
  console.error('Redis server cannot be reachead: ' + err);
});

var app = express();
app.use(logger('short'));
app.use(bodyParser());
app.use('/public', express.static(__dirname + '/public'));
restify.defaults({
   outputFn: function(res, result) {
    var urlParts = url.parse(res.req.originalUrl, true);
    var lang = urlParts.query.lang;
    var cb = sendResult.bind(null, res);
    if (typeof lang !== 'undefined') {
      if (result instanceof Array) {
        var next = after(result.length, cb);
        result.forEach(function(val, ind) {
          var cb2 = updateArr.bind(null, ind, result, next);
          localizeStrings(lang, cb2, val);
        });
      } else {
        localizeStrings(lang, cb, result);
      }
    } else {
      cb(null, result);
    }
  }
});
app.get('/api/v1/localisation/:key', function(req, res) {
  var cb = function(res, object) { res.send(object); }.bind(null, res);
  redis.get(req.params.key, function(err, val) {
    if (err) {
      cb({error: 'Error while fetching key: ' + err});
    } else if (val) {
      cb({value: val});
    }
  });
});

app.post('/api/v1/localisation', function(req, res) {
  console.log(req.body);
  redis.set(req.body.key, req.body.val);
  res.status(200);
  res.json({success: 'Localisation added'});
});

restify.serve(app, Artist);
restify.serve(app, Faq);
restify.serve(app, News);
restify.serve(app, Program);
restify.serve(app, Stage);

function sendResult(res, err, result) {
  res.send(result);
}

function localizeStrings(lang, cb, object) {
  var keys = Object.keys(object);
  var next = after(keys.length, cb);
  keys.forEach(localizeObjectField.bind(null, object, next, lang));
}

function localizeObjectField(object, next, lang, key) {
  redis.get([key, lang].join('-'), function(err, reply) {
    if(err) {
      console.error('Error while accessing redis with key: ' + [key, lang].join('-'));
    } else if(reply) {
      object[key] = reply;
    }
    next(err, object);
  });
}

function updateArr(index, arr, cb, err, object) {
  if (!err) {
    arr[index] = object;
  }
  cb(err, arr);
}

var port = Number(process.env.PORT || 8080);
http.createServer(app).listen(port);
console.log('Running at port '+port);
