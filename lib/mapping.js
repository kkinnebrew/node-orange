/**
 mapping.js | 10.28.2012 | v1.0
 TickerType Portfolio Tracker
 Copyright 2012 Kevin Kinnebrew
 */

var Class = require('./class');

var Mapping = Class.extend({

  initialize: function(mapper) {
    this.mapper = mapper;
  },
  
  map: function(source) {
    if (source instanceof Array) {
      var output = [];
      for (var i=0; i<source.length; i++) {
        output.push(this.mapItem(source[i]));
      }
      return output;
    } else {
      return this.mapItem(source);
    }
  },
  
  mapItem: function(source) {
    return this.mapper.call(this, source);
  }

});

module.exports = Mapping;