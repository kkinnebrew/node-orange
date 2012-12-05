/**
 async.js | 10.28.2012 | v1.0
 TickerType Portfolio Tracker
 Copyright 2012 Kevin Kinnebrew
 */

// imports

var _ = require('underscore');

var Deferred = require('node-promise').defer;

// definition

function Runner(fn, args, context) {
  this.fn = fn;
  this.args = args;
  this.context = context;
}

Runner.prototype.run = function() {
  return this.fn.apply(this.context || this, this.args || []);
};

function series(items, args, context) {
  
  if (!items || items.length === 0) {
    throw 'Invalid Items';
  }
  
  // get array of items
  items = items.concat();
  
  // validate args
  if (!(args instanceof Array)) {
    args = [args];
  }
  
  // create deferred
  var deferred = new Deferred();
  
  // store output
  var output = [];
  
  // callback
  function next() {
    var args = Array.prototype.slice.call(arguments);
    args.push(output);
    var action = items.shift();
    if (action) {
      var promise = action.apply(context || this, args);
      if (promise && typeof promise.then === 'function') {
        promise.then(function() {
          var args = Array.prototype.slice.call(arguments);
          output.push(args.length > 0 ? args[0] : null);
          next.apply(this, arguments);
        }, function() {
          deferred.reject();
        });
      } else if (promise !== undefined && promise !== false) {
        output.push(promise);
        next.call(this, promise);
      } else {
        output.push(null);
        deferred.reject();
      }
    }
    else {
      deferred.resolve.apply(this, args);
    }  
  }
  
  function runSeries() {
  
    // start series
    next.apply(context || this, args);
    
    // return deferred
    return deferred;
    
  }

  // return runner
  return new Runner(runSeries, args, context, deferred);
  
}

function parallel(items, args, context) {
  
  // check items
  if (!items || items.length === 0) {
    throw 'Invalid Items';
  }
  
  // create deferred
  var deferred = new Deferred();
  
  function runParallel() {
  
    var promise;
    var isArray = items instanceof Array;
    var count = isArray ? items.length : Object.keys(items).length;
    var run = 0;
    var output = isArray ? [] : {};
    var reject = false;
    
    function check() {
      count--;
      if (count === 0 && !reject) {
        deferred.resolve(output);
      } else if (count === 0) {
        deferred.reject();
      }
    }
    
    _.each(items, function(item, key) {
      var index = isArray ? run.toString() : key;
      var promise = item.apply(context || this, arguments);
      if (promise && typeof promise.then === 'function') {
        promise.then(function(result) {
          output[index] = result;
          check();
        }, function() {
          output[index] = null;
          reject = true;
          check();
        });
      } else if (promise) {
        output[index] = promise;
        check();
      } else {
        output[index] = null;
        reject = true;
        check();
      }
      run++;
    }, this);
    
    return deferred;

  }
  
  // return runner
  return new Runner(runParallel, args, context, deferred);

}

function parallelMap(items, fn, context) {
  
  // check items
  if (!items || items.length === 0) {
    throw 'Invalid Items';
  }
  
  // create deferred
  var deferred = new Deferred();
  
  function runParallel() {
  
    var promise;
    var isArray = items instanceof Array;
    var count = isArray ? items.length : Object.keys(items).length;
    var run = 0;
    var output = isArray ? [] : {};
    var reject = false;
    
    function check() {
      count--;
      if (count === 0 && !reject) {
        deferred.resolve(output);
      } else if (count === 0) {
        deferred.reject();
      }
    }
    
    _.each(items, function(item, key) {
      var index = isArray ? (typeof item === 'object' ? key : item) : key;
      var promise;
      if (isArray) {
        promise = fn.call(context || this, item);
      } else if (isArray && item instanceof Array) {
        promise = fn.apply(context || this, item);
      } else {
        promise = fn.call(context || this, item);
      }
      if (promise && typeof promise.then === 'function') {
        promise.then(function(result) {
          output[index] = result;
          check();
        }, function() {
          output[index] = null;
          reject = true;
          check();
        });
      } else if (promise) {
        output[index] = promise;
        check();
      } else {
        output[index] = null;
        reject = true;
        check();
      }
      run++;
    }, this);
    
    return deferred;

  }
  
  // return runner
  return new Runner(runParallel, [], context, deferred);

}

//var securities = ['aapl', 'bac', 'col'];
//
//parallelMap(securities, function(security) {
//  var deferred = new Deferred();
//  setTimeout(function() {
//    deferred.resolve(security + 1);
//  }, 1000);
//  return deferred;
//}, { test: 1 }).run().then(function(result) {
//  console.log('success', result);
//}, function() {
//  console.log('error');
//});

//var test = series([
//  function(item, output) {
//    console.log(item, output, this);
//    return 1;
//  },
//  function(item, output) {
//    console.log(item, output, this);
//    var deferred = new Deferred();
//    setTimeout(function() {
//      deferred.resolve(2);
//    }, 2000);
//    return deferred;
//  },
//  function(item, output) {
//    console.log(item, output, this);
//    return true;
//  },
//  function(item, output) {
//    console.log(item, output, this);
//    return 4;
//  }
//], 0, { name:'test' });
//
//test.run().then(function(item, output) {
//  console.log('success', item, output);
//}, function() {
//  console.log('error');
//});

//var test = parallel({
//  'one': function() {
//    var defer = new Deferred();
//    setTimeout(function() {
//      console.log(1);
//      defer.resolve(6);
//    }, 1000);
//    return defer;
//  },
//  'two': function() {
//    var defer = new Deferred();
//    setTimeout(function() {
//      console.log(2);
//      defer.reject(7);
//    }, 800);
//    return defer;
//  },
//  'three': function() {
//    console.log(3);
//    return true;
//  },
//  'four': function() {
//    console.log(4);
//    return 'abc';
//  }
//}, [], { test: true });
//
//test.run().then(function(args) {
//  console.log('success', args);
//}, function() {
//  console.log('failure');
//});


module.exports = {
  series: series,
  parallel: parallel,
  parallelMap: parallelMap
};