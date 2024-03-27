const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    connectionLimit: 10, 
    host: 'linkpreviewapi.cfugcmkuu6je.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Divya123',
    database: 'URLPreview',
    port: 3306
  });
  
module.exports = pool;
