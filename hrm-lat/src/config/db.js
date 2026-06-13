const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  timezone: '+07:00',
});

const promisePool = pool.promise();

// Fix timezone để DATE field không bị lệch
promisePool.query("SET time_zone = '+07:00'");

promisePool.getConnection()
  .then(connection => {
    console.log('✅ Đã kết nối thành công với MySQL!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
  });

module.exports = promisePool;