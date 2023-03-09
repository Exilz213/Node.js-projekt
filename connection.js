const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'momed21',
  password: 'Mohammed1234',
  database: 'node'
});

db.connect(function(err){
  if(err) {
      console.log(err);
  } else {
      console.log('connected to mySQL');
  }
});


module.exports = db;