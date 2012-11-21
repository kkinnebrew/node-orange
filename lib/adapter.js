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
  
  processField: function(data, type) {
    if (type === 'boolean') {
      return parseInt(data, 10) ? true : false;
    } else {
      return data;
    }
  },
  
  get: function() {
    
    var deferred = new Deferred();
    
    var that = this;
    
    var query = "SELECT * FROM " + this.getTableName() + ";";
        
    this.db.query(query, [], function(err, rows, fields) {
      if (rows instanceof Array && rows.length > 0) {
        var entities = _.map(rows, function(row) {      
          return that.getEntity(row);
        });
        deferred.resolve(entities);
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
        
    _.each(this.getSchema(), function(value, key) {
      if (value.type !== 'key' && value.name !== 'created' && value.name !== 'updated') {
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
        that.db.query("SELECT * FROM " + table + " WHERE " + name + "Id = ? LIMIT 1;", [result.insertId], function(err, rows, fields) {
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
    
  }

});

// exports

module.exports = Adapter;