/**
 orange.js | 10.28.2012 | v1.0
 TickerType Portfolio Tracker
 Copyright 2012 Kevin Kinnebrew
 */

var Adapter = require('./adapter');
var API = require('./api');
var Async = require('./async');
var Class = require('./class');
var Server = require('./server');

function run(Server, port) {
  var s = new Server(port);
}

function proxy(fn, context) {
  var that = context;
  return function() {
    return fn.apply(that, arguments);
  };
}

module.exports = {
  Adapter: Adapter,
  API: API,
  Async: Async,
  Class: Class,
  Server: Server,
  run: run,
  proxy: proxy
};