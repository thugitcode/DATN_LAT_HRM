import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const fmt = (n: number) => (n || 0).toLocaleString('vi-VN') + ' ₫';

const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className={`flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 ${highlight ? 'font-semibold' : ''}`}>
    <span className={`text-sm ${highlight ? 'text-gray-800' : 'text-gray-500'}`}>{label}</span>
    <span className={`text-sm ${highlight ? 'text-gray-900' : 'text-gray-700'}`}>{value}</span>
  </div>
);

const Card = ({ title, icon, children, accent }: { title: string; icon: string; children: React.ReactNode; accent?: string }) => (
  <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
    <div className={`flex items-center gap-2.5 px-5 py-3.5 ${accent || 'bg-gray-50/50 border-b border-gray-100'}`}>
      <span>{icon}</span>
      <h3 className={`text-xs font-bold uppercase tracking-wider ${accent ? 'text-white' : 'text-gray-500'}`}>{title}</h3>
    </div>
    <div className="px-5 py-1">{children}</div>
  </div>
);

export const UserPayslip = () => {
  const [payslip, setPayslip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/payroll/results/${user.id}-${month}/detailed`)
      .then(r => r.json())
      .then(d => { setPayslip(d.statusCode === 200 ? d.data : null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [month, user.id]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Phiếu lương</h2>
          <p className="text-sm text-gray-400 mt-0.5">Chi tiết thu nhập và khấu trừ hàng tháng</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20" />
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
        </div>
      ) : !payslip ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm border border-gray-100">
          <p className="text-4xl mb-2">💰</p>
          <p className="text-sm">Chưa có phiếu lương tháng {month}</p>
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="mb-5 rounded-2xl bg-[#2C3782] p-6 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/60">Phiếu lương tháng</p>
                <p className="mt-0.5 text-2xl font-bold">{month}</p>
                <p className="mt-2 text-base font-semibold">{payslip.staffName}</p>
                <p className="text-sm text-white/50">{payslip.staffCode} · {payslip.departmentName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/60">Thực nhận</p>
                <p className="mt-1 text-3xl font-bold text-green-300">{fmt(payslip.netIncome)}</p>
              </div>
            </div>
            {/* Tóm tắt công */}
            <div className="mt-5 grid grid-cols-4 gap-3 pt-5 border-t border-white/10">
              {[
                { label: 'Ngày công', value: `${payslip.totalAttendance}/${payslip.standardWorkingDays}` },
                { label: 'Ca trực', value: `${payslip.onCallDays} ca` },
                { label: 'Tăng ca', value: `${payslip.totalOvertimeHours} giờ` },
                { label: 'Nghỉ phép', value: `${payslip.paidLeave} ngày` },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-white/10 px-3 py-2.5 text-center">
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2 cột */}
          <div className="grid grid-cols-2 gap-5">
            <Card title="Thu nhập" icon="💵">
              <Row label="Lương theo công" value={fmt(payslip.actualWorkSalary)} />
              <Row label="Phụ cấp trực đêm" value={fmt(payslip.onCallSalary)} />
              <Row label="Phụ cấp khác" value={fmt(payslip.allowanceAmount || 0)} />
              <Row label="Tăng ca" value={fmt(payslip.overtimeAmount)} />
              <Row label="Thu nhập khác" value={fmt(payslip.otherIncomeAmount)} />
              <Row label="Thưởng KPI" value={fmt(payslip.performanceSalary)} />
              <Row label="Thưởng doanh số" value={fmt(payslip.bonusAmount)} />
              <Row label="Tổng thu nhập" value={fmt(payslip.totalBeforeDeduction)} highlight />
            </Card>

            <Card title="Khấu trừ" icon="📋">
              <Row label="BHXH (8%)" value={fmt(payslip.socialInsurance)} />
              <Row label="BHYT (1.5%)" value={fmt(payslip.healthInsurance)} />
              <Row label="BHTN (1%)" value={fmt(payslip.unemploymentInsurance)} />
              <Row label="Thu nhập chịu thuế" value={fmt(payslip.taxableIncome)} />
              <Row label="Thuế TNCN" value={fmt(payslip.personalIncomeTax)} />
              <Row label="Phạt vi phạm" value={fmt(payslip.violationPenalty || 0)} />
              <Row label="Tổng khấu trừ" value={fmt(payslip.totalDeduction)} highlight />
            </Card>
          </div>

          {/* Net */}
          <div className="mt-5 rounded-2xl border-2 border-green-200 bg-green-50 p-5 text-center">
            <p className="text-sm font-medium text-green-700 mb-1">THỰC NHẬN THÁNG {month}</p>
            <p className="text-4xl font-bold text-green-600">{fmt(payslip.netIncome)}</p>
          </div>
        </>
      )}
    </div>
  );
};