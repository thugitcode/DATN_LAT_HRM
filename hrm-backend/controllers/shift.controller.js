const db = require('../config/db');

const shiftController = {
  // [GET] Lấy danh sách ca
  getAllShifts: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM shifts ORDER BY created_at DESC');
      res.status(200).json({ success: true, data: rows });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // [POST] Thêm mới ca làm việc
  createShift: async (req, res) => {
    try {
      // Đã bổ sung handover_time và rest_time_after vào đây
      const { code, name, shift_type, start_time, end_time, work_hours, handover_time, rest_time_after, break_times, rules, status } = req.body;
      
      const dbStatus = status === false || status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const breakTimesJson = break_times && break_times.length > 0 ? JSON.stringify(break_times) : null;
      
      const late_allowance = rules?.lateGrace || 0;
      const early_allowance = rules?.earlyGrace || 0;
      const coefficient = rules?.workCoef || 1.0;
      const allowance = rules?.allowance || 0;
      const comp_type = rules?.exchangeType || 'SHIFT';
      const comp_coefficient = rules?.exchangeCoef || 1.0;

      // Đã bổ sung handover_time và rest_time_after vào câu lệnh SQL
      const sql = `INSERT INTO shifts 
        (code, name, shift_type, start_time, end_time, work_hours, handover_time, break_times, 
         late_allowance, early_allowance, coefficient, allowance, comp_type, comp_coefficient, rest_time_after, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      const values = [
        code, name, shift_type, 
        start_time || null, end_time || null, work_hours || null, handover_time || 0, 
        breakTimesJson, 
        late_allowance, early_allowance, coefficient, allowance, comp_type, comp_coefficient, rest_time_after || 0, dbStatus
      ];
      
      const [result] = await db.query(sql, values);
      res.status(201).json({ success: true, message: 'Thêm ca làm việc thành công', insertId: result.insertId });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: 'Mã ca đã tồn tại trong hệ thống' });
      }
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // [PUT] Cập nhật ca làm việc
  updateShift: async (req, res) => {
    try {
      const { id } = req.params;
      const { name, shift_type, start_time, end_time, work_hours, handover_time, rest_time_after, break_times, rules, status } = req.body;
      
      const dbStatus = status === false || status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const breakTimesJson = break_times && break_times.length > 0 ? JSON.stringify(break_times) : null;
      
      const late_allowance = rules?.lateGrace || 0;
      const early_allowance = rules?.earlyGrace || 0;
      const coefficient = rules?.workCoef || 1.0;
      const allowance = rules?.allowance || 0;
      const comp_type = rules?.exchangeType || 'SHIFT';
      const comp_coefficient = rules?.exchangeCoef || 1.0;

      const sql = `UPDATE shifts SET 
        name=?, shift_type=?, start_time=?, end_time=?, work_hours=?, handover_time=?, break_times=?, 
        late_allowance=?, early_allowance=?, coefficient=?, allowance=?, comp_type=?, comp_coefficient=?, rest_time_after=?, status=? 
        WHERE id=?`;
      
      const values = [
        name, shift_type, 
        start_time || null, end_time || null, work_hours || null, handover_time || 0, breakTimesJson, 
        late_allowance, early_allowance, coefficient, allowance, comp_type, comp_coefficient, rest_time_after || 0, dbStatus, id
      ];
      
      const [result] = await db.query(sql, values);
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy ca làm việc' });
      res.status(200).json({ success: true, message: 'Cập nhật thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  },

  // [DELETE] Xóa ca làm việc
  deleteShift: async (req, res) => {
    try {
      const { id } = req.params;
      const [result] = await db.query('DELETE FROM shifts WHERE id = ?', [id]);
      
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Không tìm thấy ca làm việc' });
      res.status(200).json({ success: true, message: 'Xóa thành công' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: error.message });
    }
  }
};

module.exports = shiftController;