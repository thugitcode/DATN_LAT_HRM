import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import dayjs from 'dayjs';

const STATUS_MAP: Record<string, { label: string; color: string; dot: string }> = {
  PRESENT:       { label: 'Đúng giờ',   color: 'bg-green-50 text-green-700',   dot: 'bg-green-500' },
  LATE:          { label: 'Đi muộn',    color: 'bg-orange-50 text-orange-700', dot: 'bg-orange-500' },
  EARLY_LEAVE:   { label: 'Về sớm',     color: 'bg-yellow-50 text-yellow-700', dot: 'bg-yellow-500' },
  MISSING_HOURS: { label: 'Thiếu giờ',  color: 'bg-amber-50 text-amber-700',   dot: 'bg-amber-500' },
  ABSENT:        { label: 'Vắng',       color: 'bg-red-50 text-red-700',       dot: 'bg-red-500' },
};

export const UserCheckin = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // Đồng hồ thời gian thực — cập nhật mỗi giây
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Ca hôm nay
  const [todayShifts, setTodayShifts] = useState<any[]>([]);
  const [loadingToday, setLoadingToday] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);
  const [checkMsg, setCheckMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Lịch sử 7 ngày gần nhất — xem nhanh không cần chuyển trang
  const [recentDays, setRecentDays] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const fetchToday = () => {
    setLoadingToday(true);
    fetch(`http://localhost:5000/api/work-schedule/my-today?employeeId=${user.id}&_t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setTodayShifts(d.data || []); setLoadingToday(false); })
      .catch(() => setLoadingToday(false));
  };

  const fetchRecent = () => {
    setLoadingRecent(true);
    const to = dayjs().format('YYYY-MM-DD');
    const from = dayjs().subtract(6, 'day').format('YYYY-MM-DD');
    fetch(`http://localhost:5000/api/work-schedule/detailed-attendance-table?fromDate=${from}&toDate=${to}&getAll=true&_t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        const me = d.data?.find((s: any) => String(s.staff?.id) === String(user.id));
        const days = (me?.days || []).slice().sort((a: any, b: any) => (a.date < b.date ? 1 : -1));
        setRecentDays(days);
        setLoadingRecent(false);
      })
      .catch(() => setLoadingRecent(false));
  };

  useEffect(() => { fetchToday(); fetchRecent(); }, [user.id]);

  const handleCheckIn = async (id: string) => {
    setActingId(id); setCheckMsg(null);
    try {
      const res = await fetch(`http://localhost:5000/api/work-schedule/${id}/self-check-in`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: user.id }),
      });
      const d = await res.json();
      if (d.statusCode === 200) {
        setCheckMsg({ type: 'success', text: `Chấm công vào thành công lúc ${dayjs().format('HH:mm:ss')}!` });
        fetchToday(); fetchRecent();
      } else setCheckMsg({ type: 'error', text: d.message || 'Chấm công vào thất bại' });
    } catch { setCheckMsg({ type: 'error', text: 'Không thể kết nối máy chủ' }); }
    setActingId(null);
  };

  const handleCheckOut = async (id: string) => {
    setActingId(id); setCheckMsg(null);
    try {
      const res = await fetch(`http://localhost:5000/api/work-schedule/${id}/self-check-out`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ employeeId: user.id }),
      });
      const d = await res.json();
      if (d.statusCode === 200) {
        const st = STATUS_MAP[d.data?.status];
        setCheckMsg({ type: 'success', text: `Chấm công ra thành công lúc ${dayjs().format('HH:mm:ss')}! Trạng thái: ${st?.label || d.data?.status}` });
        fetchToday(); fetchRecent();
      } else setCheckMsg({ type: 'error', text: d.message || 'Chấm công ra thất bại' });
    } catch { setCheckMsg({ type: 'error', text: 'Không thể kết nối máy chủ' }); }
    setActingId(null);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Chấm công</h2>
        <p className="text-sm text-gray-400 mt-0.5">Chấm công vào/ra cho ca làm việc hôm nay</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Cột trái: đồng hồ + chấm công */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Đồng hồ thời gian thực */}
          <div className="rounded-2xl bg-gradient-to-br from-[#2C3782] to-[#1a2154] p-6 text-white shadow-sm text-center">
            <p className="text-sm text-white/70">{dayjs(now).format('dddd, DD/MM/YYYY')}</p>
            <p className="mt-1 text-5xl font-bold tracking-wide">{dayjs(now).format('HH:mm:ss')}</p>
          </div>

          {/* Thông báo kết quả chấm công */}
          {checkMsg && (
            <div className={`rounded-xl px-4 py-3 text-sm ${checkMsg.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {checkMsg.text}
            </div>
          )}

          {/* Ca hôm nay + nút chấm công */}
          <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
            <h3 className="mb-3 text-sm font-semibold text-gray-700">Ca làm việc hôm nay</h3>
            {loadingToday ? (
              <div className="flex h-24 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
              </div>
            ) : todayShifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-sm">Bạn không có ca làm việc nào được phân hôm nay.</p>
                <p className="text-xs mt-1">Nếu đây là nhầm lẫn, vui lòng liên hệ HR để được xếp ca.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {todayShifts.map((s) => {
                  const st = STATUS_MAP[s.status];
                  return (
                    <div key={s.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {s.shift_name} <span className="text-gray-400 text-xs font-normal">({s.start_time?.slice(0,5)}–{s.end_time?.slice(0,5)})</span>
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Giờ vào: <span className="font-medium text-gray-600">{s.check_in_time ? dayjs(s.check_in_time).format('HH:mm:ss') : '--'}</span>
                          {'  ·  '}Giờ ra: <span className="font-medium text-gray-600">{s.check_out_time ? dayjs(s.check_out_time).format('HH:mm:ss') : '--'}</span>
                        </p>
                      </div>
                      {!s.check_in_time ? (
                        <button disabled={actingId === s.id} onClick={() => handleCheckIn(s.id)}
                          className="rounded-xl bg-[#2C3782] px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#232c68] disabled:opacity-50">
                          {actingId === s.id ? 'Đang xử lý...' : 'Chấm công vào'}
                        </button>
                      ) : !s.check_out_time ? (
                        <button disabled={actingId === s.id} onClick={() => handleCheckOut(s.id)}
                          className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 disabled:opacity-50">
                          {actingId === s.id ? 'Đang xử lý...' : 'Chấm công ra'}
                        </button>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${st?.color || 'bg-gray-50 text-gray-600'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${st?.dot || 'bg-gray-400'}`} />
                          {st?.label || s.status}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link to="/user/timekeeping" className="self-start text-sm font-medium text-[#2C3782] hover:underline">
            Xem đầy đủ bảng chấm công theo tháng →
          </Link>
        </div>

        {/* Cột phải: lịch sử 7 ngày gần nhất */}
        <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-5">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">7 ngày gần nhất</h3>
          {loadingRecent ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
            </div>
          ) : recentDays.length === 0 ? (
            <p className="text-sm text-gray-400">Chưa có dữ liệu.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {recentDays.map((d, i) => {
                const st = STATUS_MAP[d.status];
                return (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{dayjs(d.date).format('DD/MM')}</p>
                      <p className="text-xs text-gray-400">{d.shiftCode || '--'}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st?.color || 'bg-gray-50 text-gray-500'}`}>
                      {st?.label || d.status || '--'}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};