const express = require('express');
const cors = require('cors');
require('dotenv').config();

const shiftRoutes = require('./routes/shift.routes');

const app = express();
app.use(cors());
app.use(express.json());

// Nhúng bộ API của Danh mục ca làm việc vào đường dẫn gốc
app.use('/api/v1/shifts', shiftRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API Server đang chạy bon bon tại cổng ${PORT}`);
});