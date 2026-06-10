const mysql = require('mysql2');
require('dotenv').config();

// Tạo một pool kết nối (giúp xử lý nhiều người dùng cùng lúc mà không bị sập)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Chuyển sang dạng Promise để code API ở chặng sau viết gọn gàng hơn
const promisePool = pool.promise();

// Log thử xem kết nối thành công chưa
promisePool.getConnection()
  .then(connection => {
    console.log('✅ Đã kết nối thành công với MySQL!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
  });

module.exports = promisePool;