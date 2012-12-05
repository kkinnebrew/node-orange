/**
 class.js | 10.28.2012 | v1.0
 TickerType Portfolio Tracker
 Copyright 2012 Kevin Kinnebrew
 */

// definition

var Class = (function() {

  var initializing = false;
  var fnTest = /\b_super\b/;

  function ObjectClass() {}

  ObjectClass.extend = function(def) {

    var prototype;
    var name;
    var _super = this.prototype;
    var That = this;
    
    initializing = true;
    prototype = new That();
    initializing = false;
    
    for (name in def) {
      prototype[name] = typeof def[name] === "function" && typeof _super[name] === "function" && fnTest.test(def[name]) ? (function(name, fn) {
        return function() {
          var tmp = this._super;
          this._super = _super[name];
          var ret = fn.apply(this, arguments);
          this._super = tmp;
          return ret;
        };
      }(name, def[name])) : def[name];
    }
    
    function Class() {
      if (!initializing && this.initialize) {
        this.initialize.apply(this, arguments);
      }
    }

    Class.prototype = prototype;
    Class.prototype.constructor = Class;
    
    Class.extend = ObjectClass.extend;
    Class.include = ObjectClass.include;

    return Class;

  };

  ObjectClass.include = function(def) {
  
    var key;
    var value;
    var ref;
    
    if (!def) {
      throw 'Missing definition';
    }
    
    for (key in def) {
      value = def[key];
      if (Array.prototype.indexOf.call(['extend', 'include'], key) < 0) {
        this.prototype[key] = value;
      }
    }
      
    return this;
    
  };

  return ObjectClass;

}());

module.exports = Class;