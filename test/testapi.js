var Orange = require('../lib/orange');
var API = Orange.API;
var TestAdapter = require('./testadapter');

var TestAPI = API.extend({
  
  initialize: function(db) {
    this.TestAdapter = new TestAdapter(db);
  },
  
  getPath: function() {
    return 'test';
  },
  
  getEndpoints: function() {
    return {
      'create': {
        secure: true,
        validate: ['test', 'title']
      },
      'remove': {
        secure: true,
        validate: ['testId']
      }
    }
  },
  
  create: function(query) {
    console.log(this);
  
    return this.request(function() {
      return this.TestAdapter.create({
        name: query.test,
        title: query.title
      });
    }, function(test) {
      console.log('created', test);
      return test;
    });
  },
  
  remove: function(query) {
    return this.request(function() {
      return this.TestAdapter.remove(query.testId);
    }, function(test) {
      console.log('deleted');
      return test;
    });
  }
  
});

module.exports = TestAPI;