/**
 adapter.js | 10.28.2012 | v1.0
 TickerType Portfolio Tracker
 Copyright 2012 Kevin Kinnebrew
 */

// imports

var _ = require('underscore');

var Class = require('./class');
var Deferred = require('node-promise').defer;

// definition

var Adapter = Class.extend({

  initialize: function(db) {
    
    // store connection
    this.db = db;
    
  },
  
  getName: function() {
    throw 'Unimplemented Exception';
  },
  
  getTableName: function() {
    return this.getName().substr(0, 1).toUpperCase() + this.getName().substr(1) + 's';
  },
  
  getSchema: function() {
    throw 'Unimplemented Exception';
  },
  
  getEntity: function(data) {
        
    var schema = this.getSchema();
    
    var entity = {};
        
    for (var field in schema) {
      if (data.hasOwnProperty(schema[field].name)) {
        entity[field] = this.processField(data[schema[field].name], schema[field].type);
      } else if (data.hasOwnProperty(field)) {
        entity[field] = this.processField(data[field], schema[field].type);
      }
    }
    
    return entity;
    
  },
  
  getEntities: function(rows) {
    var that = this;
    return _.map(rows, function(row) {      
      return that.getEntity(row);
    });
  },
  
  processField: function(data, type) {
    if (type === 'boolean') {
      return parseInt(data, 10) ? true : false;
    } else {
      return data;
    }
  },
  
  select: function(params) {
  
    var deferred = new Deferred();
    
    var that = this;
    
    var where = [];
    var values = [];
    
    for (var param in params) {
      if (params[param] instanceof Array) {
        where.push(param + ' IN (' + params[param].join(', ') + ')');
        for (var i=0; i<params[param].length; i++) {
          values.push(params[param][i]);
        }
      } else if (typeof params[param] === 'object' && (params[param].$lt || params.param.$gt || params.param.$ne)) {
        if (params[param].$lt) {
          where.push(param + ' < ?');
          values.push(params[param].$lt);
        } else if (params[param].$gt) {
          where.push(param + ' > ?');
          values.push(params[param].$gt);
        } else if (params[param].$ne) {
          where.push(param + ' != ?');
          values.push(params[param].$ne);
        }
      } else {
        where.push(param + ' = ?');
        values.push(params[param]);
      }
    }
        
    var query = "SELECT * FROM " + this.getTableName() + " WHERE " + where.join(' AND ') + ";";
        
    this.db.query(query, values, function(err, rows, fields) {
      if (rows instanceof Array && rows.length > 0) {
        deferred.resolve(that.getEntities(rows));
      } else if (rows instanceof Array && rows.length === 0) {
        deferred.resolve([]);
      } else {
        deferred.reject();
      }
    });
    
    return deferred;
    
  },
  
  selectOne: function(params) {
  
    var deferred = new Deferred();
    
    var that = this;
    
    var where = [];
    var values = [];
    
    for (var param in params) {
      if (params[param] instanceof Array) {
        where.push(param + ' IN (' + params[param].join(', ') + ')');
        for (var i=0; i<params[param].length; i++) {
          values.push(params[param][i]);
        }
      } else if (typeof params[param] === 'object' && (params[param].$lt || params.param.$gt || params.param.$ne)) {
        if (params[param].$lt) {
          where.push(param + ' < ?');
          values.push(params[param].$lt);
        } else if (params[param].$gt) {
          where.push(param + ' > ?');
          values.push(params[param].$gt);
        } else if (params[param].$ne) {
          where.push(param + ' != ?');
          values.push(params[param].$ne);
        }
      } else {
        where.push(param + ' = ?');
        values.push(params[param]);
      }
    }
        
    var query = "SELECT * FROM " + this.getTableName() + " WHERE " + where.join(' AND ') + " LIMIT 0,1;";
        
    this.db.query(query, values, function(err, rows, fields) {
      if (rows instanceof Array && rows.length > 0) {
        var entity = that.getEntity(rows[0]);      
        deferred.resolve(entity);
      } else {
        deferred.reject();
      }
    });
    
    return deferred;
    
  },
  
  get: function() {
    
    var deferred = new Deferred();
    
    var that = this;
    
    var query = "SELECT * FROM " + this.getTableName() + ";";
        
    this.db.query(query, [], function(err, rows, fields) {
      if (rows instanceof Array && rows.length > 0) {
        deferred.resolve(that.getEntities(rows));
      } else {
        deferred.reject();
      }
    });
    
    return deferred;
    
  },
  
  getOne: function(entityId) {
    
    var deferred = new Deferred();
    
    var that = this;
    
    var query = "SELECT * FROM " + this.getTableName() + " WHERE " + this.getName() + "Id = ?;";
        
    this.db.query(query, [entityId], function(err, rows, fields) {
      if (rows instanceof Array && rows.length > 0) {
        var entity = that.getEntity(rows[0]);      
        deferred.resolve(entity);
      } else {
        deferred.reject();
      }
    });
    
    return deferred;
    
  },
  
  create: function(data) {
    
    var deferred = new Deferred();
    var that = this;
    
    var schema = this.getSchema();
    var fields = [];
    var marks = [];
    var values = [];
    
    var customId;
        
    _.each(this.getSchema(), function(value, key) {
      if (value.type !== 'key' && value.name !== 'created' && value.name !== 'updated' || (value.type === 'key' && value.custom)) {
        if (value.custom) {
          customId = data[key];
        }
        if (data.hasOwnProperty(value.name)) {
          fields.push(value.name);
          marks.push('?');
          values.push(data[key]); 
        } else if (value.required) {
          throw 'Missing field ' + value.name;
        }
      }
    });
        
    var table = this.getTableName();
    var name = this.getName();
    
    var query = "INSERT INTO " + table + " (" + fields.join(', ') + ", created, updated) VALUES (" + marks.join(', ') + ", NOW(), NOW());";
        
    this.db.query(query, values, function(err, result, fields) {
      if (!result || result.affectedRows === 0) {
        deferred.reject();
      } else {
        that.db.query("SELECT * FROM " + table + " WHERE " + name + "Id = ? LIMIT 1;", [customId ? customId : result.insertId], function(err, rows, fields) {
          if (!rows || rows.length === 0) {
            deferred.reject();
          } else {
            var entity = that.getEntity(rows[0]);
            deferred.resolve(entity);
          }
        });
      }
    });
    
    return deferred;
    
  },
  
  update: function(entityId, data) {
    
    var deferred = new Deferred();
    var that = this;
    
    var fields = [];
    var values = [];
            
    _.each(this.getSchema(), function(value, key) {
      if (value.type !== 'key' && value.name !== 'created' && value.name !== 'updated') {
        if (data.hasOwnProperty(value.name)) {
          fields.push(value.name + ' = ?');
          values.push(data[key]);
        } else if (value.required) {
          throw 'Missing field ' + value.name;
        }
      }
    });
    
    if (fields.length === 0) {
      throw 'No fields specified';
    }
    
    values.push(entityId);
        
    var table = this.getTableName();
    var name = this.getName();
    
    var query = "UPDATE " + table + " SET " + fields.join(', ') + " WHERE " + name + "Id = ? LIMIT 1;";
        
    this.db.query(query, values, function(err, result, fields) {
      if (!result || result.affectedRows === 0) {
        deferred.reject();
      } else {
        that.db.query("SELECT * FROM " + table + " WHERE " + name + "Id = ? LIMIT 1;", [entityId], function(err, rows, fields) {
          if (!rows || rows.length === 0) {
            deferred.reject();
          } else {
            var entity = that.getEntity(rows[0]);
            deferred.resolve(entity);
          }
        });
      }
    });
    
    return deferred;
    
  },
  
  remove: function(entityId) {
    
    var deferred = new Deferred();
    
    var query = "DELETE FROM " + this.getTableName() + " WHERE " + this.getName() + "Id = ?;";
        
    this.db.query(query, [entityId], function(err, result, fields) {
      if (!result || result.affectedRows === 0) {
        deferred.reject();
      } else {
        deferred.resolve(true);
      }
    });
    
    return deferred;
    
  },
  
  removeWhere: function(params) {
    
    var deferred = new Deferred();
    
    var that = this;
    
    var where = [];
    var values = [];
    
    for (var param in params) {
      if (params[param] instanceof Array) {
        where.push(param + ' IN (' + params[param].join(', ') + ')');
        for (var i=0; i<params[param].length; i++) {
          values.push(params[param][i]);
        }
      } else if (typeof params[param] === 'object' && (params[param].$lt || params.param.$gt || params.param.$ne)) {
        if (params[param].$lt) {
          where.push(param + ' < ?');
          values.push(params[param].$lt);
        } else if (params[param].$gt) {
          where.push(param + ' > ?');
          values.push(params[param].$gt);
        } else if (params[param].$ne) {
          where.push(param + ' != ?');
          values.push(params[param].$ne);
        }
      } else {
        where.push(param + ' = ?');
        values.push(params[param]);
      }
    }
    
    if (where.length === 0 || values.length === 0) {
      deferred.reject();
      return deferred;
    }
        
    var query = "DELETE FROM " + this.getTableName() + " WHERE " + where.join(' AND ') + ";";
        
    this.db.query(query, values, function(err, result, fields) {
      if (!result || result.affectedRows === 0) {
        deferred.reject();
      } else {
        deferred.resolve(true);
      }
    });
    
    return deferred;
    
  }

});

// exports

module.exports = Adapter;