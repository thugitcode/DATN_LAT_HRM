import { useEffect, useState } from 'react';
import dayjs from 'dayjs';

const SHIFT_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  FIXED:   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  ON_CALL: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  FLEXIBLE:{ bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-200' },
};

const STATUS_COLOR: Record<string, string> = {
  PRESENT:     'bg-green-400',
  LATE:        'bg-orange-400',
  EARLY_LEAVE: 'bg-yellow-400',
  ABSENT:      'bg-red-400',
  HOLIDAY:     'bg-blue-400',
  LEAVE_PAID:  'bg-purple-400',
  ON_CALL:     'bg-indigo-400',
  SCHEDULED:   'bg-gray-300',
};

const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const UserSchedule = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5000/api/work-schedule/calendar?employeeId=${user.id}&month=${month}`)
      .then(r => r.json())
      .then(d => {
        const arr = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
        const me = arr.find((s: any) => String(s.staff?.id) === String(user.id));
        setData(me?.schedules || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [month, user.id]);

  const firstDay = dayjs(`${month}-01`);
  const daysInMonth = firstDay.daysInMonth();
  const startDow = firstDay.day();
  const weeks: (number | null)[][] = [];
  let week: (number | null)[] = Array(startDow).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) weeks.push([...week, ...Array(7 - week.length).fill(null)]);

  const scheduleMap: Record<number, any> = {};
  data.forEach(s => { scheduleMap[dayjs(s.date).date()] = s; });

  const totalShifts  = data.filter(s => s.shifts?.length > 0).length;
  const totalOnCall  = data.filter(s => s.shifts?.some((sh: any) => sh.shiftTemplateType === 'ON_CALL')).length;
  const totalPresent = data.filter(s => s.shifts?.some((sh: any) => ['PRESENT','LATE'].includes(sh.status))).length;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Lịch phân ca</h2>
          <p className="text-sm text-gray-400 mt-0.5">Lịch làm việc được xếp trong tháng</p>
        </div>
        <input type="month" value={month} onChange={e => setMonth(e.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2C3782]/20" />
      </div>

      <div className="mb-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Ca được xếp',  value: totalShifts,  color: 'from-[#2C3782] to-[#3d4f9f]' },
          { label: 'Ca trực đêm',  value: totalOnCall,  color: 'from-indigo-500 to-indigo-600' },
          { label: 'Đã chấm công', value: totalPresent, color: 'from-green-500 to-emerald-600' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl bg-gradient-to-br ${s.color} p-5 text-white shadow-sm`}>
            <p className="text-3xl font-bold">{s.value}</p>
            <p className="mt-1 text-sm text-white/70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
          {DOW.map((d, i) => (
            <div key={d} className={`py-3 text-center text-xs font-bold uppercase tracking-wide
              ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>{d}</div>
          ))}
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#2C3782] border-t-transparent" />
          </div>
        ) : (
          weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-gray-50 last:border-0">
              {week.map((day, di) => {
                const s = day ? scheduleMap[day] : null;
                const shifts = s?.shifts || [];
                const isToday = day === dayjs().date() && month === dayjs().format('YYYY-MM');
                const isWeekend = di === 0 || di === 6;
                return (
                  <div key={di} className={`min-h-[90px] p-2 border-r border-gray-50 last:border-0
                    ${!day ? 'bg-gray-50/30' : isWeekend ? 'bg-gray-50/40' : ''}
                    ${isToday ? 'ring-2 ring-inset ring-[#2C3782]/30' : ''}`}>
                    {day && (
                      <>
                        <div className={`mb-1.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold
                          ${isToday ? 'bg-[#2C3782] text-white' : isWeekend ? 'text-gray-400' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        <div className="flex flex-col gap-1">
                          {shifts.map((sh: any, i: number) => {
                            const c = SHIFT_COLOR[sh.shiftTemplateType as string] ?? SHIFT_COLOR.FIXED!;
                            const dot = STATUS_COLOR[sh.status] || STATUS_COLOR.SCHEDULED;
                            return (
                              <div key={i} className={`rounded-lg border px-1.5 py-1 ${c.bg} ${c.border}`}>
                                <div className="flex items-center gap-1">
                                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                                  <span className={`text-xs font-semibold truncate ${c.text}`}>{sh.shiftTemplateCode}</span>
                                </div>
                                {sh.startTime && (
                                  <p className={`text-[10px] ${c.text} opacity-60`}>
                                    {sh.startTime.slice(0,5)}–{sh.endTime?.slice(0,5)}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-400">
        {[
          { dot: 'bg-green-400',  label: 'Đúng giờ' },
          { dot: 'bg-orange-400', label: 'Đi muộn' },
          { dot: 'bg-red-400',    label: 'Vắng mặt' },
          { dot: 'bg-purple-400', label: 'Nghỉ phép' },
          { dot: 'bg-blue-400',   label: 'Nghỉ lễ' },
          { dot: 'bg-indigo-400', label: 'Trực đêm' },
          { dot: 'bg-gray-300',   label: 'Chưa chấm' },
        ].map(s => (
          <span key={s.label} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${s.dot}`} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
};