import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:  { label: 'Chờ duyệt',  color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  APPROVED: { label: 'Đã duyệt',   color: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED: { label: 'Từ chối',    color: 'bg-red-50 text-red-700 border-red-200' },
  CANCELLED:{ label: 'Đã hủy',     color: 'bg-gray-50 text-gray-500 border-gray-200' },
};

export const UserLeave = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [quotas, setQuotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ leaveQuotaId: '', fromDate: '', toDate: '', reason: '' });
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      fetch(`http://localhost:5000/api/leave-request?staffId=${user.id}&limit=20`).then(r => r.json()),
      fetch(`http://localhost:5000/api/leave-quota`).then(r => r.json()),
    ]).then(([req, quota]) => {
      setRequests(req.data || []);
      setQuotas(quota.data?.filter((q: any) => q.status === 'ACTIVE') || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [user.id]);

  const totalDays = (from: string, to: string) => {
    if (!from || !to) return 0;
    return Math.max(1, dayjs(to).diff(dayjs(from), 'day') + 1);
  };

  const handleSubmit = async () => {
    if (!form.leaveQuotaId || !form.fromDate || !form.toDate || !form.reason) {
      setMsg({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin!' }); return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/leave-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffId: user.id,
          leaveQuotaId: form.leaveQuotaId,
          fromDate: form.fromDate,
          toDate: form.toDate,
          totalDays: totalDays(form.fromDate, form.toDate),
          reason: form.reason,
        }),
      });
      const d = await res.json();
      if (res.ok || d.statusCode === 200 || d.success) {
        setMsg({ type: 'success', text: 'Gửi đơn xin nghỉ thành công!' });
        setShowForm(false);
        setForm({ leaveQuotaId: '', fromDate: '', toDate: '', reason: '' });
        fetchData();
      } else {
        setMsg({ type: 'error', text: d.message || 'Gửi đơn thất bại!' });
      }
    } catch { setMsg({ type: 'error', text: 'Không thể kết nối máy chủ!' }); }
    setSubmitting(false);
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Bạn có chắc muốn hủy đơn này không?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/leave-request/${id}/cancel`, { method: 'PATCH' });
      const d = await res.json();
      if (d.statusCode === 200) { setMsg({ type: 'success', text: 'Đã hủy đơn nghỉ!' }); fetchData(); }
      else setMsg({ type: 'error', text: d.message || 'Hủy thất bại!' });
    } catch { setMsg({ type: 'error', text: 'Không thể kết nối máy chủ!' }); }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Đơn xin nghỉ phép</h2>
          <p className="text-sm text-gray-400 mt-0.5">Tạo và theo dõi trạng thái đơn nghỉ</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setMsg(null); }}
          className="flex items-center gap-2 rounded-xl bg-[#2C3782] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3d4f9f] transition-colors">
          {showForm ? '✕ Đóng' : '+ Tạo đơn mới'}
        </button>
      </div>

      {/* Alert */}
      {msg && (
        <div className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${
          msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.type === 'success' ? '✅ ' : '❌ '}{msg.text}</div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5">Thông tin đơn nghỉ</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Loại nghỉ *</label>
              <select value={form.leaveQuotaId} onChange={e => setForm({...form, leaveQuotaId: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20">
                <option value="">-- Chọn loại nghỉ --</option>
                {quotas.map(q => <option key={q.id} value={q.id}>{q.name} (tối đa {q.maxQuota} {q.maxQuotaUnit === 'DAY' ? 'ngày' : q.maxQuotaUnit})</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Từ ngày *</label>
              <input type="date" value={form.fromDate} onChange={e => setForm({...form, fromDate: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Đến ngày *</label>
              <input type="date" value={form.toDate} min={form.fromDate} onChange={e => setForm({...form, toDate: e.target.value})}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20" />
            </div>
            {form.fromDate && form.toDate && (
              <div className="col-span-2">
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-2.5 text-sm text-blue-700 font-medium">
                  📅 Tổng số ngày nghỉ: <span className="font-bold">{totalDays(form.fromDate, form.toDate)} ngày</span>
                </div>
              </div>
            )}
            <div className="col-span-2">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Lý do *</label>
              <textarea value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}
                rows={3} placeholder="Nhập lý do xin nghỉ..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20 resize-none" />
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => setShowForm(false)}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">
              Hủy
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              className="rounded-xl bg-[#2C3782] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3d4f9f] disabled:opacity-50 transition-colors">
              {submitting ? 'Đang gửi...' : 'Gửi đơn'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <p className="text-4xl mb-2">📋</p>
            <p className="text-sm">Chưa có đơn xin nghỉ nào</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                {['Loại nghỉ','Từ ngày','Đến ngày','Số ngày','Lý do','Trạng thái',''].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requests.map((r, i) => {
                const st = (STATUS_MAP[r.status] ?? STATUS_MAP['PENDING'])!;
                return (
                  <tr key={i} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{r.leaveType || '--'}</td>
                    <td className="px-5 py-3.5 text-gray-600">{dayjs(r.fromDate).format('DD/MM/YYYY')}</td>
                    <td className="px-5 py-3.5 text-gray-600">{dayjs(r.toDate).format('DD/MM/YYYY')}</td>
                    <td className="px-5 py-3.5 font-semibold text-[#2C3782]">{r.totalDays} ngày</td>
                    <td className="px-5 py-3.5 text-gray-500 max-w-[200px] truncate">{r.reason}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {r.status === 'PENDING' && (
                        <button onClick={() => handleCancel(r.id)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                          Hủy
                        </button>
                      )}
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