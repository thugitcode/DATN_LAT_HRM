import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';

const PERIOD_STATUS_LABEL: Record<string, { label: string; color: string }> = {
  DRAFT:      { label: 'Chưa tính lương', color: 'bg-gray-100 text-gray-600' },
  CALCULATED: { label: 'Đã tính lương',   color: 'bg-blue-50 text-blue-700' },
  LOCKED:     { label: 'Đã chốt lương',   color: 'bg-green-50 text-green-700' },
};

const PIE_COLORS = ['#2C3782', '#6576FF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const formatVND = (v: number) => new Intl.NumberFormat('vi-VN').format(Math.round(v || 0));
const monthLabel = (m: any) => dayjs(`${m}-01`).format('MM/YYYY');

export const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('http://localhost:5000/api/dashboard/summary', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // ── Báo cáo chi tiết — có bộ lọc khoảng thời gian riêng ──
  const [fromMonth, setFromMonth] = useState(dayjs().subtract(5, 'month').format('YYYY-MM'));
  const [toMonth, setToMonth] = useState(dayjs().format('YYYY-MM'));
  const [reports, setReports] = useState<any>(null);
  const [loadingReports, setLoadingReports] = useState(true);

  const fetchReports = () => {
    setLoadingReports(true);
    fetch(`http://localhost:5000/api/dashboard/reports?fromMonth=${fromMonth}&toMonth=${toMonth}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setReports(d.data); setLoadingReports(false); })
      .catch(() => setLoadingReports(false));
  };

  useEffect(() => { fetchReports(); }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
      </div>
    );
  }
  if (!data) {
    return <div className="p-6 text-sm text-gray-400">Không tải được dữ liệu tổng quan.</div>;
  }

  const { employees, attendanceToday, pending, payrollPeriod, byDepartment } = data;
  const periodInfo = PERIOD_STATUS_LABEL[payrollPeriod.status] || { label: 'Chưa tính lương', color: 'bg-gray-100 text-gray-600' };
  const attendanceRate = attendanceToday.totalScheduled > 0
    ? Math.round((attendanceToday.checkedIn / attendanceToday.totalScheduled) * 100)
    : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Tổng quan hệ thống</h2>
        <p className="text-sm text-gray-400 mt-0.5">Cập nhật theo thời gian thực — {new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      {/* ═══ PHẦN 1: SNAPSHOT TỨC THỜI ═══ */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-[#2C3782] to-[#1a2154] p-5 text-white shadow-sm">
          <p className="text-3xl font-bold">{employees.total}</p>
          <p className="mt-1 text-xs text-white/70">Tổng nhân sự</p>
          <p className="mt-2 text-xs text-white/60">{employees.working} đang làm · {employees.resigned} đã nghỉ</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-sm">
          <p className="text-3xl font-bold">{attendanceRate}%</p>
          <p className="mt-1 text-xs text-white/70">Tỷ lệ chấm công hôm nay</p>
          <p className="mt-2 text-xs text-white/60">{attendanceToday.checkedIn}/{attendanceToday.totalScheduled} đã chấm công</p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white shadow-sm">
          <p className="text-3xl font-bold">{pending.leaveRequests + pending.explanations}</p>
          <p className="mt-1 text-xs text-white/70">Đơn chờ duyệt</p>
          <p className="mt-2 text-xs text-white/60">{pending.leaveRequests} nghỉ phép · {pending.explanations} giải trình</p>
        </div>
        <div className={`rounded-2xl p-5 shadow-sm ${periodInfo.color}`}>
          <p className="text-lg font-bold">{periodInfo.label}</p>
          <p className="mt-1 text-xs opacity-70">Kỳ lương tháng {payrollPeriod.month}</p>
          <Link to="/admin/payroll-management" className="mt-2 inline-block text-xs font-medium underline">
            Xem chi tiết →
          </Link>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-3 gap-6">
        <div className="col-span-2 rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Chấm công hôm nay</h3>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Đã chấm công', value: attendanceToday.checkedIn, color: 'text-green-600 bg-green-50' },
              { label: 'Chưa chấm công', value: attendanceToday.notCheckedIn, color: 'text-gray-500 bg-gray-50' },
              { label: 'Đi muộn', value: attendanceToday.late, color: 'text-orange-600 bg-orange-50' },
              { label: 'Vắng mặt', value: attendanceToday.absent, color: 'text-red-600 bg-red-50' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-4 text-center ${s.color}`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="mt-1 text-xs">{s.label}</p>
              </div>
            ))}
          </div>

          <h3 className="mb-3 mt-6 text-sm font-semibold text-gray-700">Cơ cấu theo khoa (Top 5)</h3>
          {byDepartment.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {byDepartment.map((d: any) => {
                const pct = employees.total > 0 ? Math.round((d.count / employees.total) * 100) : 0;
                return (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 truncate text-xs text-gray-600">{d.name}</span>
                    <div className="h-2 flex-1 rounded-full bg-gray-100">
                      <div className="h-2 rounded-full bg-[#2C3782]" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-medium text-gray-500">{d.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">Cần xử lý</h3>
          <div className="flex flex-col gap-3">
            <Link to="/admin/leave-management" className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 hover:bg-gray-100">
              <span className="text-sm text-gray-700">Đơn nghỉ phép chờ duyệt</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pending.leaveRequests > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                {pending.leaveRequests}
              </span>
            </Link>
            <Link to="/admin/timekeeping-shift-scheduling/explanation-management" className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 hover:bg-gray-100">
              <span className="text-sm text-gray-700">Giải trình chờ duyệt</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pending.explanations > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                {pending.explanations}
              </span>
            </Link>
            <Link to="/admin/payroll-management/payslip-feedback" className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3 hover:bg-gray-100">
              <span className="text-sm text-gray-700">Phản hồi lương chờ xử lý</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pending.payslipFeedback > 0 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                {pending.payslipFeedback}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ PHẦN 2: BÁO CÁO QUẢN TRỊ CHI TIẾT — có bộ lọc khoảng thời gian ═══ */}
      <div className="mb-4 flex items-center justify-between border-t border-gray-100 pt-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Báo cáo quản trị</h2>
          <p className="text-sm text-gray-400 mt-0.5">Phân tích xu hướng theo khoảng thời gian tùy chọn</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={fromMonth} onChange={e => setFromMonth(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20" />
          <span className="text-gray-400">→</span>
          <input type="month" value={toMonth} onChange={e => setToMonth(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20" />
          <button onClick={fetchReports}
            className="rounded-xl bg-[#2C3782] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#232c68]">
            Lọc
          </button>
        </div>
      </div>

      {loadingReports ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
        </div>
      ) : !reports ? (
        <p className="text-sm text-gray-400">Không tải được báo cáo chi tiết.</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Biến động nhân sự */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Biến động nhân sự — Nhân viên mới theo tháng</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={reports.headcountTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
                <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip labelFormatter={monthLabel} formatter={(v: any) => [`${v} người`, 'Nhân viên mới']} />
                <Bar dataKey="hired" name="Nhân viên mới" fill="#2C3782" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chi phí lương theo tháng */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Chi phí lương theo tháng</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={reports.payrollTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
                <XAxis dataKey="month" tickFormatter={monthLabel} tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${Math.round(v / 1000000)}tr`} />
                <Tooltip labelFormatter={monthLabel} formatter={(v: any) => `${formatVND(v)} đ`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="totalGross" name="Tổng Gross" stroke="#6576FF" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="netIncome" name="Tổng Net" stroke="#22C55E" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
            {reports.payrollTrend.every((r: any) => r.totalGross === 0) && (
              <p className="mt-2 text-xs text-gray-400 text-center">Chưa có tháng nào được tính lương trong khoảng đã chọn.</p>
            )}
          </div>

          {/* Chấm công theo khoa */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Tỷ lệ đi muộn / vắng mặt theo khoa</h3>
            {reports.attendanceByDept.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có dữ liệu chấm công trong khoảng đã chọn.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={reports.attendanceByDept} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f4" />
                  <XAxis type="number" tick={{ fontSize: 12 }} unit="%" />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => `${v}%`} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="lateRate" name="Đi muộn" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="absentRate" name="Vắng mặt" fill="#EF4444" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Nghỉ phép theo loại */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Ngày nghỉ đã dùng theo loại</h3>
            {reports.leaveByType.length === 0 ? (
              <p className="text-sm text-gray-400">Chưa có đơn nghỉ nào được duyệt trong khoảng đã chọn.</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="55%" height={220}>
                  <PieChart>
                    <Pie data={reports.leaveByType} dataKey="totalDays" nameKey="name" innerRadius={45} outerRadius={80} paddingAngle={2}>
                      {reports.leaveByType.map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => `${v} ngày`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-1 flex-col gap-2">
                  {reports.leaveByType.map((l: any, i: number) => (
                    <div key={l.name} className="flex items-center gap-2 text-xs">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="flex-1 truncate text-gray-600">{l.name}</span>
                      <span className="font-semibold text-gray-800">{l.totalDays} ngày</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};