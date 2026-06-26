import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:          { label: 'Chờ duyệt',       color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  MANAGER_APPROVED: { label: 'Trưởng khoa duyệt', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  APPROVED:         { label: 'Đã duyệt',          color: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED:         { label: 'Từ chối',            color: 'bg-red-50 text-red-700 border-red-200' },
  HR_REJECTED:      { label: 'HR từ chối',         color: 'bg-red-50 text-red-700 border-red-200' },
};

const TYPE_OPTIONS = [
  { value: 'FORGOT_CHECKIN',  label: 'Quên chấm vào' },
  { value: 'FORGOT_CHECKOUT', label: 'Quên chấm ra' },
  { value: 'LATE_REASON',     label: 'Lý do đi muộn' },
  { value: 'ABSENT_REASON',   label: 'Lý do vắng mặt' },
  { value: 'OTHER',           label: 'Lý do khác' },
];

export const UserExplanation = () => {
  const [list, setList]         = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [month, setMonth]       = useState(dayjs().format('YYYY-MM'));
  const [form, setForm]         = useState({ workDate: '', type: 'OTHER', reason: '' });
  const [msg, setMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = () => {
    setLoading(true);
    const from = `${month}-01`;
    const to = dayjs(month).endOf('month').format('YYYY-MM-DD');
    Promise.all([
      fetch(`http://localhost:5000/api/attendance-explanation?employeeId=${user.id}&limit=50`).then(r => r.json()),
      fetch(`http://localhost:5000/api/work-schedule/detailed-attendance-table?fromDate=${from}&toDate=${to}&getAll=true`).then(r => r.json()),
    ]).then(([exp, att]) => {
      setList(exp.data?.filter((e: any) => String(e.staffId) === String(user.id)) || []);
      const me = att.data?.find((s: any) => String(s.staff?.id) === String(user.id));
      // Chỉ lấy ngày ABSENT hoặc LATE
      const needExp = (me?.days || []).filter((d: any) => ['ABSENT','LATE','EARLY_LEAVE'].includes(d.status));
      setAttendance(needExp);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [month, user.id]);

  const handleSubmit = async () => {
    if (!form.workDate || !form.reason) {
      setMsg({ type: 'error', text: 'Vui lòng chọn ngày và nhập lý do!' }); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/attendance-explanation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: user.id, workDate: form.workDate, type: form.type, reason: form.reason }),
      });
      const d = await res.json();
      if (d.statusCode === 200) {
        setMsg({ type: 'success', text: 'Gửi giải trình thành công!' });
        setShowForm(false);
        setForm({ workDate: '', type: 'OTHER', reason: '' });
        fetchData();
      } else {
        setMsg({ type: 'error', text: d.message || 'Gửi thất bại!' });
      }
    } catch { setMsg({ type: 'error', text: 'Không thể kết nối máy chủ!' }); }
    setSubmitting(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Giải trình chấm công</h2>
          <p className="text-sm text-gray-400 mt-0.5">Gửi giải trình khi có lỗi chấm công</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={e => setMonth(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20" />
          <button onClick={() => { setShowForm(!showForm); setMsg(null); }}
            className="flex items-center gap-2 rounded-xl bg-[#2C3782] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3d4f9f] transition-colors">
            {showForm ? '✕ Đóng' : '+ Tạo giải trình'}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${
          msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.type === 'success' ? '✅ ' : '❌ '}{msg.text}</div>
      )}

      {/* Ngày cần giải trình */}
      {attendance.length > 0 && !showForm && (
        <div className="mb-5 rounded-2xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm font-semibold text-orange-700 mb-3">⚠️ Các ngày cần giải trình tháng {month}:</p>
          <div className="flex flex-wrap gap-2">
            {attendance.map((d, i) => (
              <button key={i} onClick={() => { setForm({...form, workDate: d.date}); setShowForm(true); }}
                className="rounded-xl border border-orange-200 bg-white px-3 py-1.5 text-xs font-medium text-orange-700 hover:bg-orange-100 transition-colors">
                {dayjs(d.date).format('DD/MM')} — {d.status === 'ABSENT' ? 'Vắng' : d.status === 'LATE' ? 'Muộn' : 'Về sớm'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5">Thông tin giải trình</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Ngày cần giải trình *</label>
              <input type="date" value={form.workDate} onChange={e => setForm({...form, workDate: e.target.value})}
                max={dayjs().format('YYYY-MM-DD')}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Loại giải trình *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20">
                {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Nội dung giải trình *</label>
              <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
                rows={4} placeholder="Mô tả rõ lý do..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20 resize-none" />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => setShowForm(false)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Hủy</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="rounded-xl bg-[#2C3782] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3d4f9f] disabled:opacity-50 transition-colors">
              {submitting ? 'Đang gửi...' : 'Gửi giải trình'}
            </button>
          </div>
        </div>
      )}

      {/* Danh sách */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <p className="text-4xl mb-2">📝</p>
            <p className="text-sm">Chưa có giải trình nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                {['Ngày','Loại','Nội dung','Trạng thái','Ghi chú HR'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const st = (STATUS_MAP[r.status] ?? STATUS_MAP['PENDING'])!;
                const typeLabel = TYPE_OPTIONS.find(t => t.value === r.type)?.label || r.type || '--';
                return (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-5 py-3.5 font-medium text-gray-800 whitespace-nowrap">
                      {r.date ? dayjs(r.date).format('DD/MM/YYYY') : r.dateLabel || '--'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">{typeLabel}</td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-[250px] truncate">{r.reason || '--'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 text-xs">{r.rejectedReason || '--'}</td>
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