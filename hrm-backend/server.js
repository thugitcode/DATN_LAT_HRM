const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

// ── Routes CŨ ────────────────────────────────────────────────
const shiftRoutes           = require('./routes/shift.routes');
const leaveReasonRoutes     = require('./routes/leaveReason.routes');
const leaveFundRoutes       = require('./routes/leaveFund.routes');
const holidayRoutes         = require('./routes/holiday.routes');
const timekeepingRoutes     = require('./routes/timekeeping.routes');
const salaryRoutes          = require('./routes/salary.routes');
const masterDataRoutes      = require('./routes/masterData.routes');
const payrollTemplateRoutes = require('./routes/payrollTemplate.routes');
const salaryScaleRoutes     = require('./routes/salaryScale.routes');
const allowanceRoutes       = require('./routes/allowance.routes');
const taxRoutes             = require('./routes/tax.routes');
const employeeRoutes        = require('./routes/employee.routes');

// ── Routes MỚI ───────────────────────────────────────────────
const staffRoutes            = require('./routes/staff.routes');
const staffContractRoutes    = require('./routes/staff-contract.routes');
const staffSalaryRoutes      = require('./routes/staff-salary.routes');
const staffDocumentRoutes    = require('./routes/staff-document.routes');
const shiftTemplateRoutes    = require('./routes/shift-template.routes');
const leaveQuotaRoutes       = require('./routes/leave-quota.routes');
const departmentRoutes       = require('./routes/department.routes');
const roomRoutes             = require('./routes/room.routes');
const jobTitleRoutes         = require('./routes/jobTitle.routes');
const uploadRoutes           = require('./routes/upload.routes');
const workScheduleRoutes     = require('./routes/work-schedule.routes');
const attendanceExpRoutes    = require('./routes/attendance-explanation.routes');
const leaveRequestRoutes     = require('./routes/leave-request.routes');

const app = express();
app.use(cors());
app.set('etag', false);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logger ────────────────────────────────────────────
const COLORS = {
  GET:    '\x1b[32m',
  POST:   '\x1b[34m',
  PATCH:  '\x1b[33m',
  PUT:    '\x1b[33m',
  DELETE: '\x1b[31m',
  RESET:  '\x1b[0m',
  DIM:    '\x1b[2m',
  GREEN:  '\x1b[32m',
  RED:    '\x1b[31m',
  YELLOW: '\x1b[33m',
  CYAN:   '\x1b[36m',
};

app.use((req, res, next) => {
  const start = Date.now();
  const time = new Date().toLocaleTimeString('vi-VN');
  const methodColor = COLORS[req.method] || '\x1b[37m';

  // Lấy tên user từ body hoặc query (nếu có)
  const who = req.body?.username || req.query?.username || '';

  // Đếm số field trong body
  const bodySize = req.body && typeof req.body === 'object'
    ? Object.keys(req.body).length
    : 0;

  // Ghi đè res.json để bắt response data
  const originalJson = res.json.bind(res);
  let responseData = null;
  res.json = (data) => {
    responseData = data;
    return originalJson(data);
  };

  res.on('finish', () => {
    const ms = Date.now() - start;
    const statusColor = res.statusCode >= 500 ? COLORS.RED
                      : res.statusCode >= 400 ? COLORS.YELLOW
                      : COLORS.GREEN;

    // Lấy message lỗi từ response nếu có
    const errMsg = res.statusCode >= 400 && responseData?.message
      ? ` ${COLORS.RED}✗ ${responseData.message}${COLORS.RESET}`
      : '';

    // Thông tin thêm
    const extra = [];
    if (who) extra.push(`${COLORS.CYAN}@${who}${COLORS.RESET}`);
    if (['POST', 'PATCH', 'PUT'].includes(req.method) && bodySize > 0)
      extra.push(`${COLORS.DIM}body:${bodySize}fields${COLORS.RESET}`);

    const extraStr = extra.length ? '  ' + extra.join(' ') : '';

    console.log(
      `${COLORS.DIM}[${time}]${COLORS.RESET} ` +
      `${methodColor}${req.method.padEnd(6)}${COLORS.RESET} ` +
      `${statusColor}${res.statusCode}${COLORS.RESET} ` +
      `${req.originalUrl.split('?')[0].padEnd(42)}` +
      `${COLORS.DIM}${String(ms).padStart(5)}ms${COLORS.RESET}` +
      `${extraStr}${errMsg}`
    );
  });

  next();
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes CŨ ────────────────────────────────────────────────
app.use('/api/v1/shifts',            shiftRoutes);
app.use('/api/v1/leave-reasons',     leaveReasonRoutes);
app.use('/api/v1/leave-funds',       leaveFundRoutes);
app.use('/api/v1/holidays',          holidayRoutes);
app.use('/api/v1/timekeeping',       timekeepingRoutes);
app.use('/api/v1/salary-configs',    salaryRoutes);
app.use('/api/v1/master-data',       masterDataRoutes);
app.use('/api/v1/payroll-templates', payrollTemplateRoutes);
app.use('/api/v1/salary-scales',     salaryScaleRoutes);
app.use('/api/v1/allowances',        allowanceRoutes);
app.use('/api/v1/tax-configs',       taxRoutes);
app.use('/api/tax',                  taxRoutes);
app.use('/api/v1/employees',         employeeRoutes);

// ── Routes MỚI ───────────────────────────────────────────────
app.use('/api/staff',           staffRoutes);
app.use('/api/department',      departmentRoutes);
app.use('/api/room',            roomRoutes);
app.use('/api/job-title',       jobTitleRoutes);
app.use('/api/upload',          uploadRoutes);
app.use('/api/staff-contract',  staffContractRoutes);
app.use('/api/staff-salary',    staffSalaryRoutes);
app.use('/api/staff-document',  staffDocumentRoutes);
app.use('/api/shift-template',  shiftTemplateRoutes);
app.use('/api/leave-quota',     leaveQuotaRoutes);
app.use('/api/work-schedule',   workScheduleRoutes);
app.use('/api/payroll',         require('./routes/payroll.routes'));
app.use('/api/attendance-explanation', attendanceExpRoutes);
app.use('/api/leave-request',   leaveRequestRoutes);

// ── Routes Payroll phụ trợ (đặt sau /api/payroll) ────────────
app.use('/api/staff-kpi', (() => {
  const r = require('express').Router();
  const c = require('./controllers/kpi.controller');
  r.get('/', c.getAll); r.get('/:id', c.getById);
  r.post('/', c.create); r.patch('/:id', c.update); r.delete('/:id', c.remove);
  return r;
})());

app.use('/api/other-income', (() => {
  const r = require('express').Router();
  const c = require('./controllers/other-income.controller');
  r.get('/', c.getAll); r.get('/:id', c.getById);
  r.post('/', c.create); r.patch('/:id', c.update); r.delete('/:id', c.remove);
  return r;
})());

app.use('/api/staff-revenue', (() => {
  const r = require('express').Router();
  const c = require('./controllers/revenue.controller');
  r.get('/', c.getAll); r.get('/:id', c.getById);
  r.post('/', c.create); r.patch('/:id', c.update); r.delete('/:id', c.remove);
  return r;
})());

// Dùng chung 2 prefix cho department/room
app.use('/api/v1/departments', departmentRoutes);
app.use('/api/v1/rooms',       roomRoutes);

app.use('/api/auth', require('./routes/auth.routes')); 

app.use('/api/allowance', allowanceRoutes);
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() }),
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 HRM Backend chạy tại http://localhost:${PORT}`),
);