import { useEffect, useState } from 'react';

const QUAL_LABEL: Record<string, string> = {
  MASTER: 'Thạc sĩ', DOCTOR: 'Tiến sĩ', BACHELOR: 'Cử nhân',
  ASSOCIATE: 'Cao đẳng', HIGH_SCHOOL: 'THPT', OTHER: 'Khác',
};

const GENDER_LABEL: Record<string, string> = { MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' };

const CCHNStatus = ({ date }: { date: string | null }) => {
  if (!date) return <span className="text-gray-400 text-sm">--</span>;
  const expiry = new Date(date);
  const today = new Date();
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);
  const fmt = expiry.toLocaleDateString('vi-VN');
  if (days < 0) return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="font-medium text-gray-800">{fmt}</span>
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-600">Đã hết hạn</span>
    </span>
  );
  if (days <= 30) return (
    <span className="inline-flex items-center gap-1.5 text-sm">
      <span className="font-medium text-gray-800">{fmt}</span>
      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-600">Còn {days} ngày</span>
    </span>
  );
  return <span className="text-sm font-medium text-gray-800">{fmt}</span>;
};

const Field = ({ label, value }: { label: string; value?: React.ReactNode }) => (
  <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
    <span className="w-44 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300">--</span>}</span>
  </div>
);

const Section = ({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) => (
  <div className="mb-5 rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
    <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
      <span className="text-lg">{icon}</span>
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{title}</h3>
    </div>
    <div className="px-6 py-1">{children}</div>
  </div>
);

const ChangePasswordModal = ({ onClose }: { onClose: () => void }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      return setError('Vui lòng điền đầy đủ thông tin');
    }
    if (form.newPassword.length < 6) {
      return setError('Mật khẩu mới phải có ít nhất 6 ký tự');
    }
    if (form.newPassword !== form.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, oldPassword: form.oldPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        setTimeout(() => {
          localStorage.removeItem('user');
          localStorage.removeItem('jwt');
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.message || 'Đổi mật khẩu thất bại');
      }
    } catch {
      setError('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">🔒 Đổi mật khẩu</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mật khẩu hiện tại</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]"
              value={form.oldPassword}
              onChange={e => setForm(f => ({ ...f, oldPassword: e.target.value }))}
              placeholder="Nhập mật khẩu hiện tại"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mật khẩu mới</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]"
              value={form.newPassword}
              onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
              placeholder="Ít nhất 6 ký tự"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]"
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Nhập lại mật khẩu mới"
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 px-4 py-2.5 rounded-lg">{error}</p>}
          {success && <p className="text-sm text-green-600 bg-green-50 px-4 py-2.5 rounded-lg">{success}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 rounded-lg bg-[#2C3782] py-2.5 text-sm font-medium text-white hover:bg-[#232d6a] disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : 'Xác nhận'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserProfile = () => {
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetch(`http://localhost:5000/api/v1/employees/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` }
    })
      .then(r => r.json())
      .then(d => { setStaff(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user.id]);

  if (loading) return (
    <div className="flex h-full items-center justify-center text-gray-400">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
        <p className="text-sm">Đang tải hồ sơ...</p>
      </div>
    </div>
  );

  if (!staff) return (
    <div className="flex h-full items-center justify-center text-gray-400">
      <p className="text-sm">Không tìm thấy hồ sơ</p>
    </div>
  );

  const dob = staff.dob ? new Date(staff.dob).toLocaleDateString('vi-VN') : null;
  const academicTitles = (() => {
    try { return (JSON.parse(staff.academic_titles) as string[]).map(t => QUAL_LABEL[t] || t).join(', '); }
    catch { return staff.academic_titles || null; }
  })();

  return (
    <div className="p-6">
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}

      {/* Hero card */}
      <div className="mb-5 rounded-2xl bg-[#2C3782] p-6 text-white shadow-lg">
        <div className="flex items-center gap-5">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-white/10 ring-2 ring-white/20">
            {staff.avatar
              ? <img src={`http://localhost:5000/${staff.avatar}`} alt="" className="h-full w-full object-cover" />
              : <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-white/80">
                  {staff.full_name?.[0]}
                </div>
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold truncate">{staff.full_name}</p>
            <p className="mt-0.5 text-sm text-white/60">{staff.job_title_name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {staff.department_name && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                  🏥 {staff.department_name}
                </span>
              )}
              {staff.room_name && (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/80">
                  🚪 {staff.room_name}
                </span>
              )}
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                staff.status === 'WORKING' ? 'bg-green-400/20 text-green-300' : 'bg-gray-400/20 text-gray-300'
              }`}>
                {staff.status === 'WORKING' ? '● Đang làm việc' : staff.status}
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-2xl font-bold">{staff.employee_code}</p>
            <p className="text-xs text-white/50 mt-1">Mã nhân viên</p>
            <button
              onClick={() => setShowChangePassword(true)}
              className="mt-3 rounded-lg bg-white/10 hover:bg-white/20 px-4 py-1.5 text-xs font-medium text-white/80 transition-colors"
            >
              🔒 Đổi mật khẩu
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Section title="Thông tin cá nhân" icon="👤">
          <Field label="Họ và tên" value={staff.full_name} />
          <Field label="Ngày sinh" value={dob} />
          <Field label="Giới tính" value={GENDER_LABEL[staff.gender]} />
          <Field label="Quốc tịch" value={staff.nationality} />
          <Field label="Số CCCD/Hộ chiếu" value={staff.identity} />
          <Field label="Ngày cấp" value={staff.identity_issue_date ? new Date(staff.identity_issue_date).toLocaleDateString('vi-VN') : null} />
          <Field label="Nơi cấp" value={staff.identity_issue_place} />
          <Field label="Địa chỉ" value={staff.address} />
        </Section>

        <Section title="Liên hệ" icon="📱">
          <Field label="Số điện thoại" value={staff.phone} />
          <Field label="Email" value={staff.email} />
          <Field label="Người liên hệ khẩn" value={staff.emergency_name} />
          <Field label="SĐT khẩn cấp" value={staff.emergency_phone} />
          <Field label="Quan hệ" value={staff.emergency_relationship} />
        </Section>

        <Section title="Chuyên môn & CCHN" icon="🏥">
          <Field label="Trình độ học vấn" value={QUAL_LABEL[staff.qualification_level]} />
          <Field label="Chuyên ngành" value={staff.major} />
          <Field label="Học hàm / Học vị" value={academicTitles} />
          <Field label="Số CCHN" value={staff.certificate_number} />
          <Field label="Nơi cấp CCHN" value={staff.certificate_issue_place} />
          <Field label="Ngày hết hạn CCHN" value={<CCHNStatus date={staff.certificate_expiry_date} />} />
        </Section>

        <Section title="Tài chính" icon="💳">
          <Field label="Mã số thuế" value={staff.tax_code} />
          <Field label="Số BHXH" value={staff.insurance_number} />
          <Field label="Số BHYT" value={staff.health_insurance_number} />
          <Field label="Số tài khoản" value={staff.bank_account} />
          <Field label="Tên chủ TK" value={staff.bank_account_name} />
          <Field label="Ngân hàng" value={staff.bank_name} />
        </Section>
      </div>
    </div>
  );
};