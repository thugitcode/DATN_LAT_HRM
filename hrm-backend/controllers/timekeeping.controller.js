const db = require('../config/db');

// --- CÁC HÀM PHÒNG THỦ TRỢ GIÚP (VALIDATORS) ---
const isValidIP = (ip) => {
  if (!ip) return true; // Cho phép trống với máy chạy qua Server
  const ipRegex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipRegex.test(ip);
};

const isValidMAC = (mac) => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

const timekeepingController = {
  // ==========================================
  // A. CẤU HÌNH CHUNG & CHU KỲ CÔNG
  // ==========================================
  getConfig: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM timekeeping_configs WHERE id = 1');
      res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi máy chủ không thể đọc cấu hình', error: error.message });
    }
  },

  updateConfig: async (req, res) => {
    try {
      const { cycle_start_day, cycle_end_day, lock_date, allow_explanation_days, auto_connect_shift } = req.body;

      // --- TẦNG PHÒNG THỦ 1: KIỂM TRA BỎ TRỐNG ---
      if (!cycle_start_day || !cycle_end_day || !lock_date || allow_explanation_days === undefined) {
        return res.status(400).json({ success: false, message: '⚠️ Vui lòng điền đầy đủ tất cả các trường cấu hình chu kỳ công!' });
      }

      // --- TẦNG PHÒNG THỦ 2: KHỐNG CHẾ MỐC NGÀY TRONG THÁNG (1 - 31) ---
      if (
        cycle_start_day < 1 || cycle_start_day > 31 || 
        cycle_end_day < 1 || cycle_end_day > 31 || 
        lock_date < 1 || lock_date > 31
      ) {
        return res.status(400).json({ success: false, message: '❌ Lỗi logic: Các mốc ngày (Bắt đầu, Kết thúc, Ngày nhắc khóa sổ) bắt buộc phải nằm trong khoảng từ ngày 1 đến ngày 31!' });
      }

      // --- TẦNG PHÒNG THỦ 3: KHỐNG CHẾ SỐ NGÀY HẠN CHÓT GIẢI TRÌNH ---
      const expDays = parseInt(allow_explanation_days);
      if (isNaN(expDays) || expDays < 0 || expDays > 30) {
        return res.status(400).json({ success: false, message: '❌ Lỗi giới hạn: Số ngày cho phép gửi đơn giải trình không thể để âm hoặc vượt quá 30 ngày!' });
      }

      const sql = `UPDATE timekeeping_configs SET 
        cycle_start_day=?, cycle_end_day=?, lock_date=?, allow_explanation_days=?, auto_connect_shift=? 
        WHERE id = 1`;
      await db.query(sql, [cycle_start_day, cycle_end_day, lock_date, expDays, auto_connect_shift ? 1 : 0]);
      
      res.status(200).json({ success: true, message: '🎉 Đã lưu toàn bộ thiết lập chu kỳ chấm công hệ thống!' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Lỗi hệ thống khi cập nhật', error: error.message });
    }
  },

  // ==========================================
  // B. QUẢN LÝ WIFI VĂN PHÒNG
  // ==========================================
  getWifis: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM timekeeping_wifis ORDER BY id DESC');
      res.status(200).json({ success: true, data: rows });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  },

  createWifi: async (req, res) => {
    try {
      const { name, ip_address, bssid } = req.body;

      // Validate phòng thủ
      if (!name?.trim()) return res.status(400).json({ success: false, message: '⚠️ Tên hiển thị WiFi (SSID) không được bỏ trống!' });
      if (!bssid?.trim()) return res.status(400).json({ success: false, message: '⚠️ Địa chỉ vật lý MAC (BSSID) là bắt buộc để định danh phần cứng!' });
      if (!isValidMAC(bssid.trim())) return res.status(400).json({ success: false, message: '❌ Định dạng địa chỉ MAC (BSSID) không đúng! (Ví dụ chuẩn: A4:97:B1:0B:D9:2B)' });
      if (ip_address && !isValidIP(ip_address.trim())) return res.status(400).json({ success: false, message: '❌ Định dạng địa chỉ IP Gateway không hợp lệ!' });

      const sql = 'INSERT INTO timekeeping_wifis (name, ip_address, bssid, status) VALUES (?, ?, ?, "ACTIVE")';
      await db.query(sql, [name.trim(), ip_address?.trim() || null, bssid.trim().toUpperCase()]);
      res.status(201).json({ success: true, message: '🎉 Thêm mới trạm kết nối WiFi cơ sở thành công!' });
    } catch (e) { res.status(500).json({ success: false, message: 'Lỗi ghi DB', error: e.message }); }
  },

  toggleWifiStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'ACTIVE' hoặc 'INACTIVE'
      await db.query('UPDATE timekeeping_wifis SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: 'Đổi trạng thái WiFi thành công' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  deleteWifi: async (req, res) => {
    try {
      await db.query('DELETE FROM timekeeping_wifis WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: '🗑️ Đã xóa trạm WiFi khỏi hệ thống kiểm soát!' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  // ==========================================
  // C. QUẢN LÝ ĐỊNH VỊ ĐỊA LÝ (GPS)
  // ==========================================
  getGps: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM timekeeping_gps ORDER BY id DESC');
      res.status(200).json({ success: true, data: rows });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  },

  createGps: async (req, res) => {
    try {
      const { name, latitude, longitude, allowed_radius } = req.body;

      if (!name?.trim()) return res.status(400).json({ success: false, message: '⚠️ Tên địa điểm không được để trống!' });
      if (!latitude || !longitude) return res.status(400).json({ success: false, message: '⚠️ Vui lòng ghim vị trí hoặc điền kinh/vĩ độ chuẩn!' });
      
      const radiusNum = parseInt(allowed_radius);
      if (isNaN(radiusNum) || radiusNum <= 0) return res.status(400).json({ success: false, message: '❌ Bán kính quét cho phép phải là một số nguyên dương (mét)!' });

      const sql = 'INSERT INTO timekeeping_gps (name, latitude, longitude, allowed_radius, status) VALUES (?, ?, ?, ?, "ACTIVE")';
      await db.query(sql, [name.trim(), parseFloat(latitude), parseFloat(longitude), radiusNum]);
      res.status(201).json({ success: true, message: '🎉 Cấu hình vùng định vị GPS thành công!' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  toggleGpsStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await db.query('UPDATE timekeeping_gps SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: 'Đổi trạng thái vùng GPS thành công' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  deleteGps: async (req, res) => {
    try {
      await db.query('DELETE FROM timekeeping_gps WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: '🗑️ Đã xóa vùng định vị địa lý!' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  // ==========================================
  // D. MÁY CHẤM CÔNG VÂN TAY VẬT LÝ
  // ==========================================
  getMachines: async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM timekeeping_machines ORDER BY id DESC');
      res.status(200).json({ success: true, data: rows });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  },

  createMachine: async (req, res) => {
    try {
      const { name, ip_address, serial_number, connection_method } = req.body;

      if (!name?.trim()) return res.status(400).json({ success: false, message: '⚠️ Tên máy chấm công không được bỏ trống!' });
      
      // Case phân tách nghiệp vụ theo hình ảnh form thêm máy của bạn
      if (connection_method === 'SERVER' && !serial_number?.trim()) {
        return res.status(400).json({ success: false, message: '⚠️ Khi chọn kết nối qua Server, bắt buộc phải nhập Số Serial (SN) trên vỏ máy!' });
      }
      if (connection_method === 'DIRECT') {
        if (!ip_address?.trim()) return res.status(400).json({ success: false, message: '⚠️ Khi chọn kết nối trực tiếp LAN, bắt buộc phải điền IP Static!' });
        if (!isValidIP(ip_address.trim())) return res.status(400).json({ success: false, message: '❌ Địa chỉ IP Static mạng LAN nhập vào không đúng định dạng!' });
      }

      const sql = 'INSERT INTO timekeeping_machines (name, ip_address, serial_number, status) VALUES (?, ?, ?, "INACTIVE")';
      await db.query(sql, [
        name.trim(), 
        connection_method === 'DIRECT' ? ip_address.trim() : null, 
        connection_method === 'SERVER' ? serial_number.trim() : 'SN-' + Date.now() // tạo SN giả lập nếu đi dây mạng trực tiếp
      ]);

      res.status(201).json({ success: true, message: '🎉 Khai báo thiết bị máy chấm công phần cứng thành công!' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  toggleMachineStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await db.query('UPDATE timekeeping_machines SET status = ? WHERE id = ?', [status, id]);
      res.status(200).json({ success: true, message: 'Đổi trạng thái máy chấm công thành công' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  },

  deleteMachine: async (req, res) => {
    try {
      await db.query('DELETE FROM timekeeping_machines WHERE id = ?', [req.params.id]);
      res.status(200).json({ success: true, message: '🗑️ Đã ngắt kết nối thiết bị máy chấm công!' });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
  }
};

module.exports = timekeepingController;