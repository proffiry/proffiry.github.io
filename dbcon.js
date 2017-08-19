var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_proffiry',
  password        : '7308',
  database        : 'cs340_proffiry'
});

module.exports.pool = pool;