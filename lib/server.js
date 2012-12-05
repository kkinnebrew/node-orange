/**
 server.js | 10.28.2012 | v1.0
 TickerType Portfolio Tracker
 Copyright 2012 Kevin Kinnebrew
 */

// imports

var _ = require('underscore');
var connect = require('connect');
var url = require('url');
var querystring = require('querystring');

var Class = require('./class');
var Deferred = require('node-promise').defer;

function proxy(fn, context) {
  var that = context;
  return function() {
    return fn.apply(that, arguments);
  };
}

// definition

function Response(data, code, msg) {

  this.data = data;
  this.statusCode = code;
  this.statusMessage = msg;
  
}

// class

var Server = Class.extend({
  
  initialize: function(port) {
    
    this.endpoints = {};
        
    this.app = connect();
    this.app.use(connect.logger('dev'));
    this.app.use(connect['static']('public'));
    this.app.use(proxy(this.request, this));
    this.app.listen(port || 3000);
    
    console.log('[INFO] Server running on port ' + port || 3000);
    
    
  },
  
  register: function(api) {
    
    var path = api.getPath();
    var endpoints = api.getEndpoints();
    
    for (var endpoint in endpoints) {
      this.endpoints['/' + path + '/' + endpoint] = {
        config: endpoints[endpoint],
        api: api,
        endpoint: endpoint
      };
    }
    
  },
  
  request: function(request, response) {
        
    var url_parts = url.parse(request.url);
    var path = url_parts.pathname;
    var query = querystring.parse(url_parts.query);
    var address = request.connection.remoteAddress;
      
    if (path === '/favicon.ico') {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end();
      return;
    } else if (path === '/') {
      response.writeHead(200, {'Content-Type': 'text/html', 'Cache-Control': 'no-cache'});
      response.end('<h1>Orange Server: Not Found</h1>');
      return;
    }
    
    if (!this.endpoints.hasOwnProperty(path)) {
    
      response.writeHead(404, {'Content-Type': 'text/html'});
      response.end();
      
    } else {
    
      var map = this.endpoints[path];
            
      var result = map.api.route.call(map.api, map.endpoint, query, response, address);
      
      result.then(function(data) {
        response.writeHead(data[0], {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
        response.end(JSON.stringify(new Response(data[2], data[0], data[1])));
      }, function(data) {
        response.writeHead(data[0], {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
        response.end(JSON.stringify(new Response(data[2], data[0], data[1])));
      });
      
    }
    
  }
  
});

module.exports = Server;