var Orange = require('../lib/orange');
var Adapter = Orange.Adapter;

var TestAdapter = Adapter.extend({
  
  getName: function() {
    return 'test';
  },
  
  getTableName: function() {
    return 'Tests';
  },
  
  getSchema: function() {
    return {
      testId: { name: 'testId', type: 'key' },
      name: { name: 'name' },
      title: { name: 'title' },
      created: { name: 'created' },
      updated: { name: 'updated' }
    };
  }
  
});

module.exports = TestAdapter;