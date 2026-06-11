const db = require('../config/db');

const masterDataController = {
  // Hàm tập trung bốc cả 4 danh mục lên cùng một lúc để giảm số lượng request từ Frontend
  getHospitalMasterData: async (req, res) => {
    try {
      const [titles] = await db.query('SELECT name FROM cat_titles ORDER BY id ASC');
      const [positions] = await db.query('SELECT name FROM cat_positions ORDER BY id ASC');
      const [degrees] = await db.query('SELECT name FROM cat_academic_degrees ORDER BY id ASC');
      const [qualifications] = await db.query('SELECT name FROM cat_qualifications ORDER BY id ASC');

      const [deps] = await db.query('SELECT code, name FROM cat_departments WHERE status="ACTIVE"');
      const [rooms] = await db.query('SELECT code, name, department_code FROM cat_rooms WHERE status="ACTIVE"');

      res.status(200).json({
        success: true,
        titles: titles.map(t => t.name),
        positions: positions.map(p => p.name),
        academicDegrees: degrees.map(d => d.name),
        qualifications: qualifications.map(q => q.name),
        departments: deps,
        rooms: rooms
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi nạp danh mục hệ thống', error: error.message });
    }
  }
};

module.exports = masterDataController;