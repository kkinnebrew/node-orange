var mysql = require('mysql');

var Orange = require('../lib/orange');
var Server = Orange.Server;

var TestAPI = require('./testapi');

var TestServer = Server.extend({
  
  initialize: function(port) {
    
    this._super(port)
    
    var db = mysql.createConnection({
      host     : 'localhost',
      user     : 'mydbadmin',
      password : 'tssrj450'
    });
        
    db.connect();
    db.query('USE test');
    
    this.TestAPI = new TestAPI(db);
    
    this.register(this.TestAPI);
  
  }
  
});

Orange.run(TestServer, 3000);