import express from 'express';
// ĐIỀU CHỈNH DÒNG NÀY: Trỏ đúng vào file kết nối DB của bạn (ví dụ: db.js hoặc database.js)
import pool from '../config/db.js'; 

const router = express.Router();

const getEmptySummary = () => ({
  totalWork: 1, totalLateMinutes: 0, totalEarlyMinutes: 0, absentDays: 0,
  workDays: 1, actualWorkDays: 1, holiday: 0, onCall: 0, otherLeave: 0,
  overtimeHours: 0, paidLeave: 0, totalAttendance: 1, compHours: 0,
  compLeave: 0, compRest: 0, socialInsuranceLeave: 0, unpaidLeave: 0,
  violationCount: 0, totalWorkHours: 8
});

// 1. API Trả về danh sách Khoa / Phòng từ Database thật
router.get('/department', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name FROM departments');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. API Trả về danh sách Phòng khám (Giữ nguyên Mock tạm thời)
router.get('/room', (req, res) => {
  res.json({ success: true, data: [{ id: 'P01', name: 'Phòng Hồi sức' }] });
});

// 3. API Cốt lõi: Lưới Phân ca Y tế (Kéo từ bảng employees và shift_schedules)
router.get('/work-schedule/attendance-table', async (req, res) => {
  try {
    // Câu Query nối 4 bảng chuẩn xác theo cấu trúc hrm_system của bạn
    const query = `
      SELECT 
        e.id as staff_id, 
        CONCAT('NV', LPAD(e.id, 3, '0')) as staff_code,
        e.full_name as staff_name, 
        u.role,
        d.id as dept_id, 
        d.name as dept_name,
        sch.work_date, 
        sch.display_code, 
        sch.id as detail_id,
        sh.id as shift_id, 
        sh.code as shift_code, 
        sh.name as shift_name, 
        sh.start_time, 
        sh.end_time
      FROM employees e
      LEFT JOIN users u ON e.id = u.employee_id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN shift_schedules sch ON e.id = sch.staff_id
      LEFT JOIN shifts sh ON sch.shift_id = sh.id
    `;
    
    const [rows] = await pool.query(query);

    // Nhào nặn dữ liệu SQL phẳng thành Cấu trúc Cây (Nested JSON) cho UI
    const staffMap = {};

    rows.forEach(row => {
      // 1. Tạo hồ sơ nhân viên nếu chưa có
      if (!staffMap[row.staff_id]) {
        staffMap[row.staff_id] = {
          staff: {
            id: String(row.staff_id),
            code: row.staff_code,
            name: row.staff_name,
            avatar: null,
            departments: row.dept_id ? [{ id: String(row.dept_id), name: row.dept_name }] : [],
            rooms: [{ id: "P01", name: "Phòng Hồi sức" }],
            position: { id: "POS1", name: row.role === 'admin' ? "Quản lý / HR" : "Nhân viên y tế" }, 
            status: "ACTIVE"
          },
          shifts: [],
          summary: getEmptySummary()
        };
      }

      // 2. Nhồi ca làm việc vào mảng shifts của người đó
      if (row.shift_id && row.work_date) {
        // Fix lỗi lệch múi giờ khi parse ngày tháng
        const dateObj = new Date(row.work_date);
        const dateStr = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        
        let existingShift = staffMap[row.staff_id].shifts.find(s => s.shift.id === row.shift_id);
        
        if (!existingShift) {
          existingShift = {
            shift: {
              id: row.shift_id,
              code: row.shift_code,
              name: row.shift_name,
              startTime: row.start_time,
              endTime: row.end_time,
              breakTimes: []
            },
            days: {},
            summary: getEmptySummary()
          };
          staffMap[row.staff_id].shifts.push(existingShift);
        }

        // Gắn ngày làm việc vào đúng ca
        existingShift.days[dateStr] = {
          workScheduleDetailId: String(row.detail_id),
          date: dateStr,
          displayCode: row.display_code,
          shiftStartTime: row.start_time,
          shiftEndTime: row.end_time,
          checkInTime: null,
          checkOutTime: null,
          status: "WORKING",
          workWeight: 1
        };
      }
    });

    const finalData = Object.values(staffMap);

    res.json({
      success: true,
      data: finalData,
      total: finalData.length
    });

  } catch (error) {
    console.error("Lỗi lấy dữ liệu DB:", error);
    res.status(500).json({ success: false, message: "Lỗi kết nối CSDL", error: error.message });
  }
});

// ==========================================
// CÁC API BỔ SUNG ĐỂ "DỖ" FRONTEND
// ==========================================
router.get('/payroll/by-month/status', (req, res) => {
  res.json({ success: true, data: { status: 'UNLOCKED' } }); 
});

router.get('/work-schedule/attendance-by-hours', (req, res) => {
  res.json({ success: true, data: [], total: 0 });
});

router.get('/work-schedule/detailed-attendance-table', (req, res) => {
  res.json({ success: true, data: [], total: 0 });
});

export default router;