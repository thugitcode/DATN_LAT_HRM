import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:   { label: 'Chờ phản hồi', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  CONFIRMED: { label: 'Đã xử lý',     color: 'bg-green-50 text-green-700 border-green-200' },
  REJECTED:  { label: 'Không chấp nhận', color: 'bg-red-50 text-red-700 border-red-200' },
};

export const UserFeedback = () => {
  const [list, setList]         = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [month, setMonth]       = useState(dayjs().format('YYYY-MM'));
  const [content, setContent]   = useState('');
  const [msg, setMsg]           = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = () => {
    setLoading(true);
    fetch(`http://localhost:5000/api/payroll/feedback?employeeId=${user.id}&limit=20`)
      .then(r => r.json())
      .then(d => {
        // API trả về dạng { data: { data: [...], pagination: {...} } } — lấy đúng d.data.data
        const rows = d.data?.data || [];
        setList(rows.filter((f: any) => String(f.staff?.id) === String(user.id)));
        setLoading(false);
      })
      .catch((err) => { console.error('[UserFeedback] fetchData error:', err); setLoading(false); });
  };

  useEffect(() => { fetchData(); }, [user.id]);

  const handleSubmit = async () => {
    if (!content.trim()) { setMsg({ type: 'error', text: 'Vui lòng nhập nội dung phản hồi!' }); return; }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/payroll/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: user.id, month, content }),
      });
      const d = await res.json();
      if (d.statusCode === 200) {
        setMsg({ type: 'success', text: 'Gửi phản hồi thành công!' });
        setShowForm(false);
        setContent('');
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
          <h2 className="text-xl font-bold text-gray-800">Phản hồi phiếu lương</h2>
          <p className="text-sm text-gray-400 mt-0.5">Gửi thắc mắc về phiếu lương đến bộ phận HR</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setMsg(null); }}
          className="flex items-center gap-2 rounded-xl bg-[#2C3782] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#3d4f9f] transition-colors">
          {showForm ? '✕ Đóng' : '+ Gửi phản hồi mới'}
        </button>
      </div>

      {msg && (
        <div className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium ${
          msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>{msg.type === 'success' ? '✅ ' : '❌ '}{msg.text}</div>
      )}

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-5">Nội dung phản hồi</h3>
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Tháng lương *</label>
              <input type="month" value={month} onChange={e => setMonth(e.target.value)}
                className="w-64 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400">Nội dung *</label>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                rows={5} placeholder="Mô tả thắc mắc về phiếu lương tháng này..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20 resize-none" />
              <p className="mt-1 text-xs text-gray-400">{content.length}/500 ký tự</p>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => { setShowForm(false); setContent(''); }}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50">Hủy</button>
            <button onClick={handleSubmit} disabled={submitting || !content.trim()}
              className="rounded-xl bg-[#2C3782] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#3d4f9f] disabled:opacity-50 transition-colors">
              {submitting ? 'Đang gửi...' : 'Gửi phản hồi'}
            </button>
          </div>
        </div>
      )}

      {/* Danh sách */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-2xl bg-white border border-gray-100">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center rounded-2xl bg-white border border-gray-100 text-gray-400">
            <p className="text-4xl mb-2">💬</p>
            <p className="text-sm">Chưa có phản hồi nào</p>
          </div>
        ) : list.map((f, i) => {
          const st = (STATUS_MAP[f.status] ?? STATUS_MAP['PENDING'])!;
          return (
            <div key={i} className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">Phiếu lương tháng {f.period?.month || f.payroll?.payrollPeriod?.month || '--'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{f.createdAt ? dayjs(f.createdAt).format('HH:mm DD/MM/YYYY') : '--'}</p>
                </div>
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${st.color}`}>
                  {st.label}
                </span>
              </div>
              {/* Nội dung gửi */}
              <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700 mb-3">
                <p className="text-xs font-semibold text-gray-400 mb-1">Nội dung phản hồi:</p>
                {f.content}
              </div>
              {/* Phản hồi từ HR */}
              {f.responseContent && (
                <div className="rounded-xl bg-blue-50 border border-blue-100 px-4 py-3 text-sm text-blue-800">
                  <p className="text-xs font-semibold text-blue-400 mb-1">Phản hồi từ HR:</p>
                  {f.responseContent}
                  {f.resolvedAt && <p className="text-xs text-blue-400 mt-1">{dayjs(f.resolvedAt).format('HH:mm DD/MM/YYYY')}</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};