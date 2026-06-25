const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'luuanhthuwannaone@gmail.com',
    pass: 'obfo fxtz iwwq idpf',
  },
});

async function sendPayslipEmail({ to, staffName, month, data }) {
  const [y, m] = month.split('-');
  const monthFormatted = `${m}/${y}`;
  const fmt = n => (n||0).toLocaleString('vi-VN') + ' đ';

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:700px;margin:0 auto;border:1px solid #ddd;">
      <div style="background:#002E62;padding:20px;text-align:center;">
        <h2 style="color:white;margin:0">DEEPCARE HRM</h2>
        <p style="color:#ccc;margin:5px 0">Phiếu Lương Tháng ${monthFormatted}</p>
      </div>
      <div style="padding:20px;background:#f9f9f9;">
        <p>Kính gửi <strong>${staffName}</strong>,</p>
        <p>Phòng Nhân sự trân trọng gửi phiếu lương tháng <strong>${monthFormatted}</strong> của bạn.</p>
      </div>
      <div style="padding:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="background:#f0f4ff">
            <td colspan="2" style="padding:8px;font-weight:bold;color:#002E62">I. THÔNG TIN NGÀY CÔNG</td>
          </tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Ngày công chuẩn</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${data.standardWorkingDays || 26} ngày</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Ngày công thực tế</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${data.totalWorkDays || data.actualWorkDays} ngày</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Ngày trực ca đêm</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${data.onCallDays || 0} ngày</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Giờ làm thêm (OT)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${data.overtimeHours || 0} giờ</td></tr>

          <tr style="background:#f0f4ff">
            <td colspan="2" style="padding:8px;font-weight:bold;color:#002E62">II. THU NHẬP</td>
          </tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Lương cơ bản hợp đồng</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(data.baseSalary)}</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Lương thực tế theo công</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(data.salaryByWork)}</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Lương tăng ca (OT)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(data.overtimeAmount)}</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Lương ca trực đêm</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(data.onCallSalary)}</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Các khoản thu nhập khác</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(data.otherIncomeAmount)}</td></tr>
          <tr style="background:#e8f5e9;font-weight:bold">
            <td style="padding:8px">TỔNG GROSS</td>
            <td style="padding:8px;text-align:right">${fmt(data.totalGross || data.totalBeforeDeduction)}</td>
          </tr>

          <tr style="background:#f0f4ff">
            <td colspan="2" style="padding:8px;font-weight:bold;color:#002E62">III. CÁC KHOẢN GIẢM TRỪ</td>
          </tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">BHXH (8%)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(data.socialInsurance)}</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">BHYT (1.5%)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(data.healthInsurance)}</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">BHTN (1%)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(data.unemploymentInsurance)}</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Công đoàn (1%)</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(data.unionFee)}</td></tr>
          <tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Thuế TNCN</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right">${fmt(data.personalIncomeTax)}</td></tr>
          ${data.violationPenalty > 0 ? `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee">Phạt vi phạm</td><td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;color:red">${fmt(data.violationPenalty)}</td></tr>` : ''}
          <tr style="background:#fce4e4;font-weight:bold">
            <td style="padding:8px">TỔNG KHẤU TRỪ</td>
            <td style="padding:8px;text-align:right;color:#c62828">${fmt(data.totalDeduction)}</td>
          </tr>

          <tr style="background:#002E62">
            <td style="padding:12px;font-weight:bold;color:white;font-size:16px">LƯƠNG NET THỰC NHẬN</td>
            <td style="padding:12px;font-weight:bold;color:#FFD700;font-size:16px;text-align:right">${fmt(data.netIncome || data.finalAmount)}</td>
          </tr>
        </table>
      </div>
      <div style="padding:15px;background:#f0f0f0;text-align:center;font-size:12px;color:#888;">
        Email được gửi tự động từ hệ thống HRM DeepCare. Vui lòng không reply.
      </div>
    </div>
  `;

  return transporter.sendMail({
    from: '"DeepCare HRM" <luuanhthuwannaone@gmail.com>',
    to,
    subject: `[DeepCare HRM] Phiếu lương tháng ${monthFormatted} - ${staffName}`,
    html,
  });
}

module.exports = { sendPayslipEmail };