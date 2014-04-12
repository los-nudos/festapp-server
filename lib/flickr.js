var cache = require('memory-cache');

var config = {
  apiKey: process.env.FLICKRAPIKEY || '',
  hashTag: process.env.FLICKRHASHTAG || 'ruisrock',
  userId: process.env.FLICKRUSERID || '92696256@N06', 
  perPage: process.env.FLICKRPERPAGE || 20
}

var getFlickr = function(){
  var Flickr = require("node-flickr");
  return new Flickr({"api_key": config.apiKey});
}

var getImageLink = function(media, type){
  return "http://farm" + media.farm + ".staticflickr.com/" + media.server  + "/" + media.id + "_" + media.secret + "_" + type + ".jpg"
}

var parseFlickrMediaObject = function(media){
  return {
    id: media.id,
    title: media.title,
    thumbnail: getImageLink(media, 't'),
    image: getImageLink(media, 'z'),
    link: "http://www.flickr.com/photos/" + media.owner + "/" + media.id
  };
}

var parseFlickrMedia = function(medias){
  var data = [];
  medias.forEach(function(media){
    data.push(parseFlickrMediaObject(media));
  });
  return data;
}

var mediaToJson = function(medias){
  return JSON.stringify({media: parseFlickrMedia(medias)});
}

var sendResponse = function(response, data){
  response.type('application/json; charset=utf-8').end(data);
}

module.exports = {
  tagMedia: function(req, res){
    var cacheKey = 'fest.flickr.tags.' + config.hashTag;
    var cached = cache.get(cacheKey);
    if(cached){
      sendResponse(res, cached);
      return;
    }
    getFlickr().get("photos.search", {"tags":config.hashTag, per_page: config.perPage}, function(result){
      var cached = mediaToJson(result.photos.photo);
      sendResponse(res, cached);
      cache.put(cacheKey, cached, 300000);  
    });    
  },
  userMedia: function(req, res) {
    var cacheKey = 'fest.flickr.user.' + config.userId;
    var cached = cache.get(cacheKey);
    if(cached){
      sendResponse(res, cached);
      return;
    }
    getFlickr().get("photos.search", {"user_id":config.userId, per_page: config.perPage}, function(result){
      var cached = mediaToJson(result.photos.photo);
      sendResponse(res, cached);
      cache.put(cacheKey, cached, 300000);  
    });
  }
}
