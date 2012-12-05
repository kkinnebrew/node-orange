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
var Mapping = require('./mapping');
var DateUtils = require('./date');
var NumberUtils = require('./number');

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
  MySQLAdapter: Adapter,
  API: API,
  Async: Async,
  Class: Class,
  Server: Server,
  Mapping: Mapping,
  DateUtils: DateUtils,
  NumberUtils: NumberUtils,
  run: run,
  proxy: proxy
};