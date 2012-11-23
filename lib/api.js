/**
 api.js | 10.28.2012 | v1.0
 TickerType Portfolio Tracker
 Copyright 2012 Kevin Kinnebrew
 */

var Class = require('./class');
var Deferred = require('node-promise').defer;

var API = Class.extend({
  
  initialize: function() {
  
  },
  
  getPath: function() {
    throw 'Not implemented';
  },
  
  getEndpoints: function() {
    throw 'Not implemented';
  },
  
  authenticate: function(query, address) {
    var deferred = new Deferred();
    deferred.resolve();
    return deferred;
  },
  
  request: function(fn, success, failure) {

    var deferred = new Deferred();

    fn.call(this).then(function() {
      if (success) {
        var result = success.apply(this, arguments);
        deferred.resolve(result);
      } else {
        deferred.resolve(true);
      }
    }, function() {
      deferred.reject();
    });
    
    return deferred;
    
  },
  
  route: function(endpoint, query, response, address) {

    var deferred = new Deferred();

    if (typeof this[endpoint] !== 'function') {
      deferred.reject([404, 'Not Found', false]);
      return deferred;
    }
    
    function toNumber(num) {
      if (typeof num === 'number') {
        return num;
      } else if (!isNaN(num) && num !== '') {
        if (parseFloat(num) == parseInt(num, 10)) {
          return parseInt(num, 10);
        } else {
          return parseFloat(num);
        }
      } else {
        return num;
      }
    }
        
    var endpoints = this.getEndpoints();
    
    if (endpoints[endpoint] && endpoints[endpoint].validate) {
      var val;
      for (var i=0; i<endpoints[endpoint].validate.length; i++) {
        val = query[endpoints[endpoint].validate[i]];
        if (!query.hasOwnProperty(endpoints[endpoint].validate[i]) || (!endpoints[endpoint].optional && val === '')) {
          deferred.reject([400, 'Bad Request', false]);
          return deferred;
        } else {
          query[endpoints[endpoint].validate[i]] = toNumber(val);
        }
      }
    }
    
    var secure = endpoints[endpoint].secure || false;
    var that = this;
        
    if (secure) {
            
      if (!query.token) {
        deferred.reject([401, 'Not Authorized', false]);
      } else {
        this.authenticate(query, address).then(function(user) {
          that[endpoint].call(that, query, user, address).then(function(result) {
            deferred.resolve([200, 'Success', result]);
          }, function(ex) {
            deferred.reject([500, ex || 'Server Error', false]);
          });
        }, function() {
          deferred.reject([401, 'Not Authorized', false]);
        });
      }
      
    } else {
    
      this[endpoint].call(this, query, address).then(function(result) {
        deferred.resolve([200, 'Success', result]);
      }, function(ex) {
        deferred.reject([500, ex || 'Server Error', false]);
      });
      
    }
    
    return deferred;
    
  }
  
});

module.exports = API;