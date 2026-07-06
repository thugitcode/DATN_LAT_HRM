import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  PRESENT:     { label: 'Đúng giờ',  color: 'bg-green-50 text-green-700',   dot: 'bg-green-500' },
  LATE:        { label: 'Đi muộn',   color: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
  EARLY_LEAVE: { label: 'Về sớm',    color: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' },
  MISSING_HOURS: { label: 'Thiếu giờ', color: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  ABSENT:      { label: 'Vắng',      color: 'bg-red-50 text-red-700',       dot: 'bg-red-500' },
  HOLIDAY:     { label: 'Nghỉ lễ',   color: 'bg-blue-50 text-blue-700',     dot: 'bg-blue-500' },
  LEAVE_PAID:  { label: 'Nghỉ phép', color: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500' },
  ON_CALL:     { label: 'Trực đêm',  color: 'bg-indigo-50 text-indigo-700', dot: 'bg-indigo-500' },
  COMPENSATORY_LEAVE: { label: 'Nghỉ bù', color: 'bg-teal-50 text-teal-700', dot: 'bg-teal-500' },
};

export const UserTimekeeping = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    setLoading(true);
    const from = `${month}-01`;
    const to = dayjs(month).endOf('month').format('YYYY-MM-DD');
    fetch(`http://localhost:5000/api/work-schedule/detailed-attendance-table?fromDate=${from}&toDate=${to}&getAll=true`)
      .then(r => r.json())
      .then(d => {
        const me = d.data?.find((s: any) => String(s.staff?.id) === String(user.id));
        setData(me?.days || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [month, user.id]);

  const totalWork   = data.filter(d => ['PRESENT','LATE','EARLY_LEAVE'].includes(d.status)).length;
  const totalOnCall = data.filter(d => d.status === 'ON_CALL').length;
  const totalLeave  = data.filter(d => ['LEAVE_PAID','HOLIDAY','COMPENSATORY_LEAVE'].includes(d.status)).length;
  const totalAbsent = data.filter(d => d.status === 'ABSENT').length;
  const totalLate   = data.filter(d => d.status === 'LATE').length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Chấm công & Lịch ca</h2>
          <p className="text-sm text-gray-400 mt-0.5">Dữ liệu chấm công cá nhân theo tháng</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20" />
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-5 gap-4">
        {[
          { label: 'Ngày công', value: totalWork,   color: 'from-green-500 to-emerald-600' },
          { label: 'Ca trực',   value: totalOnCall, color: 'from-indigo-500 to-indigo-600' },
          { label: 'Nghỉ phép', value: totalLeave,  color: 'from-purple-500 to-purple-600' },
          { label: 'Đi muộn',  value: totalLate,   color: 'from-orange-500 to-orange-600' },
          { label: 'Vắng mặt', value: totalAbsent, color: 'from-red-500 to-red-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} p-4 text-white shadow-sm`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="mt-1 text-xs text-white/70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-sm">Chưa có dữ liệu chấm công tháng này</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                {['Ngày','Ca làm việc','Giờ chuẩn','Giờ vào','Giờ ra','Trạng thái','Phút muộn'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => {
                const st = STATUS_MAP[d.status] || { label: d.status, color: 'bg-gray-50 text-gray-600', dot: 'bg-gray-400' };
                const isWeekend = [0, 6].includes(new Date(d.date).getDay());
                return (
                  <tr key={i} className={`border-t border-gray-50 transition-colors hover:bg-gray-50/50 ${isWeekend ? 'bg-gray-50/30' : ''}`}>
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-800">{dayjs(d.date).format('DD/MM')}</span>
                      {isWeekend && <span className="ml-1.5 text-xs text-gray-400">CN</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500">{d.shiftCode || '--'}</td>
                    <td className="px-5 py-3 text-gray-500">{d.standardTime || '--'}</td>
                    <td className="px-5 py-3 font-medium text-gray-700">{d.checkInTime ? dayjs(d.checkInTime).format('HH:mm') : '--'}</td>
                    <td className="px-5 py-3 font-medium text-gray-700">{d.checkOutTime ? dayjs(d.checkOutTime).format('HH:mm') : '--'}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${st.color}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${st.dot}`} />
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {d.lateMinutes > 0
                        ? <span className="font-semibold text-orange-600">{d.lateMinutes} ph</span>
                        : <span className="text-gray-300">--</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};