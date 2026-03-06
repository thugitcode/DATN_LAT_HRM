import { forwardRef, type CSSProperties } from 'react';
import dayjs from 'dayjs';

import { LayoutSwitcherEnum } from '@/types/global.type';
import type { DetailsTimeSheetRecord } from '@/types/shift-details.type';
import { getDaysInMonth, getWeeksInMonth } from '@/features/timekeeping-shift-scheduling/helper';
import { STAFF_POSITION } from '@/features/timekeeping-shift-scheduling/shift-management/constants/data';

import { TAB_KEYS } from '../types/index.type';
import type {
  AttendanceByHoursResponse,
  WorkSheetByShiftType,
} from '../types/timekeeping-management.type';

// ─── Shared styles ────────────────────────────────────────────────────────────

const DAY_SHORT: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

const thTitle: CSSProperties = {
  backgroundColor: '#374151',
  color: '#fff',
  fontWeight: 'bold',
  border: '1px solid #9ca3af',
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: '2px',
};
const thWeek: CSSProperties = {
  backgroundColor: '#6b7280',
  color: '#fff',
  fontWeight: 'bold',
  border: '1px solid #9ca3af',
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: '2px',
};
const thDay: CSSProperties = {
  backgroundColor: '#9ca3af',
  color: '#fff',
  fontWeight: 'bold',
  border: '1px solid #9ca3af',
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: '2px',
  fontSize: '9px',
};
const tdBase: CSSProperties = {
  border: '1px solid #9ca3af',
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: '2px',
  wordBreak: 'break-word',
  lineHeight: '1.3',
  fontSize: '9px',
};
const tdEven: CSSProperties = { ...tdBase, backgroundColor: '#ffffff' };
const tdOdd: CSSProperties = { ...tdBase, backgroundColor: '#f9fafb' };
const tdLeft: CSSProperties = { textAlign: 'left', paddingLeft: '3px' };

const SUMMARY_COLS = [
  { key: 'totalAttendance', label: 'Tổng công' },
  { key: 'actualWorkDays', label: 'Ngày làm' },
  { key: 'paidLeave', label: 'Nghỉ phép' },
  { key: 'onCall', label: 'Công trực' },
  { key: 'compLeave', label: 'Nghỉ bù trực' },
  { key: 'holiday', label: 'Nghỉ lễ' },
  { key: 'otherLeave', label: 'Nghỉ khác' },
  { key: 'overtimeHours', label: 'Tăng ca' },
  { key: 'compHours', label: 'Giờ bù' },
] as const;

type SummaryKey = (typeof SUMMARY_COLS)[number]['key'];

const DETAIL_COLS = [
  { key: 'date', label: 'Ngày', fmt: (v: string) => dayjs(v).format('DD/MM/YYYY') },
  { key: 'shiftCode', label: 'Mã ca', fmt: (v: string) => v },
  { key: 'standardTime', label: 'Giờ chuẩn', fmt: (v: string) => v },
  { key: 'checkInTime', label: 'Giờ vào', fmt: (v: string | null) => v ?? '' },
  { key: 'checkOutTime', label: 'Giờ ra', fmt: (v: string | null) => v ?? '' },
  { key: 'lateMinutes', label: 'Trễ (ph)', fmt: (v: number) => v },
  { key: 'earlyMinutes', label: 'Sớm (ph)', fmt: (v: number) => v },
  { key: 'workCount', label: 'Số công', fmt: (v: number) => v },
  { key: 'totalWorkHours', label: 'Tổng giờ làm', fmt: (v: number) => v },
  { key: 'overtimeHours', label: 'Giờ OT', fmt: (v: number) => v },
  { key: 'compHours', label: 'Giờ bù', fmt: (v: number) => v },
] as const;

// ─── Signature footer ─────────────────────────────────────────────────────────

const SignatureFooter = () => (
  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
    {['Trưởng Đơn Vị', 'TL. Hành chánh - Nhân sự', 'Lập Bảng'].map((title) => (
      <div key={title} style={{ width: '30%', textAlign: 'center' }}>
        <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '28px' }}>{title}</div>
        <div style={{ fontStyle: 'italic', fontSize: '9px' }}>(Ký, họ tên)</div>
      </div>
    ))}
  </div>
);

// ─── Print style ──────────────────────────────────────────────────────────────

const PrintStyle = () => (
  <style>{`@media print {
    body * { visibility: hidden; }
    .timekeeping-print-wrap, .timekeeping-print-wrap * { visibility: visible; }
    .timekeeping-print-wrap { position: fixed; inset: 0; padding: 8mm 10mm; background: white; }
    @page { size: A3 landscape; margin: 0; }
  }`}</style>
);

// ─── WorkSheetByShift print ───────────────────────────────────────────────────

function WorkSheetByShiftPrintTable({
  data,
  year,
  month,
  isGrid,
}: {
  data: WorkSheetByShiftType[];
  year: number;
  month: number;
  isGrid: boolean;
}) {
  const weeks = getWeeksInMonth(year, month);
  const allDays = weeks.flatMap((w) => w.days);
  const days = getDaysInMonth(year, month);

  const colDays = isGrid ? days : allDays;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '16px' }} />
        {isGrid ? (
          <>
            <col style={{ width: '50px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '70px' }} />
            <col style={{ width: '40px' }} />
          </>
        ) : (
          <>
            <col style={{ width: '60px' }} />
            <col style={{ width: '50px' }} />
            <col style={{ width: '70px' }} />
            <col style={{ width: '40px' }} />
          </>
        )}
        <col style={{ width: '55px' }} />
        {colDays.map((_, i) => (
          <col key={i} style={{ width: `${Math.floor(400 / colDays.length)}px` }} />
        ))}
        {SUMMARY_COLS.map((c) => (
          <col key={c.key} style={{ width: '30px' }} />
        ))}
      </colgroup>

      <thead>
        {/* Week row (list only) */}
        {!isGrid && (
          <tr>
            <th colSpan={6} style={thTitle} />
            {weeks.map((week) => (
              <th key={week.weekNumber} colSpan={week.days.length} style={thWeek}>
                T{week.weekNumber}: {week.startDay}/{month + 1}-{week.endDay}/{month + 1}
              </th>
            ))}
            <th colSpan={SUMMARY_COLS.length} style={thWeek}>
              Tổng hợp
            </th>
          </tr>
        )}

        <tr>
          <th style={thDay}>STT</th>
          {isGrid ? (
            <>
              <th style={thDay}>Mã NV</th>
              <th style={thDay}>Họ và tên</th>
              <th style={thDay}>Khoa/Phòng</th>
              <th style={thDay}>Chức vụ</th>
            </>
          ) : (
            <>
              <th style={thDay}>Khoa/phòng</th>
              <th style={thDay}>Mã NV</th>
              <th style={thDay}>Họ và tên</th>
              <th style={thDay}>Chức vụ</th>
            </>
          )}
          <th style={thDay}>Ca làm việc</th>
          {colDays.map((d) => {
            const date = isGrid
              ? (d as ReturnType<typeof getDaysInMonth>[number]).date
              : dayjs(
                  new Date(
                    year,
                    month,
                    (d as ReturnType<typeof getWeeksInMonth>[number]['days'][number]).day,
                  ),
                ).format('YYYY-MM-DD');
            const dow = isGrid
              ? (d as ReturnType<typeof getDaysInMonth>[number]).dayOfWeek
              : (d as ReturnType<typeof getWeeksInMonth>[number]['days'][number]).dayOfWeek;
            const label = isGrid
              ? dayjs(date).format('D/M')
              : `${(d as ReturnType<typeof getWeeksInMonth>[number]['days'][number]).day}/${month + 1}`;
            return (
              <th key={date} style={thDay}>
                <div>{DAY_SHORT[dow]}</div>
                <div>{label}</div>
              </th>
            );
          })}
          {SUMMARY_COLS.map((c) => (
            <th key={c.key} style={{ ...thDay, fontSize: '7px' }}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((record, idx) => {
          const { staff, shifts } = record;
          const isEven = idx % 2 === 0;
          const td = isEven ? tdEven : tdOdd;
          const numShifts = Math.max(shifts.length, 1);

          // Aggregate summary
          const totalSummary = shifts.reduce(
            (acc, s) => {
              SUMMARY_COLS.forEach(({ key }) => {
                acc[key] = (acc[key] ?? 0) + ((s.summary[key] as number) ?? 0);
              });
              return acc;
            },
            {} as Record<SummaryKey, number>,
          );

          return shifts.map((shiftEntry, shiftIdx) => {
            const isFirst = shiftIdx === 0;
            return (
              <tr key={`${staff.id}-${shiftIdx}`}>
                {isFirst && (
                  <>
                    <td rowSpan={numShifts} style={td}>
                      {idx + 1}
                    </td>
                    {isGrid ? (
                      <>
                        <td rowSpan={numShifts} style={td}>
                          {staff.code}
                        </td>
                        <td rowSpan={numShifts} style={{ ...td, ...tdLeft }}>
                          {staff.name}
                        </td>
                        <td rowSpan={numShifts} style={{ ...td, ...tdLeft }}>
                          {staff.departments?.map((d) => d.name).join(', ')}
                        </td>
                        <td rowSpan={numShifts} style={td}>
                          {STAFF_POSITION[staff.position] ?? ''}
                        </td>
                      </>
                    ) : (
                      <>
                        <td rowSpan={numShifts} style={{ ...td, ...tdLeft }}>
                          {staff.departments?.map((d) => d.name).join(', ')}
                        </td>
                        <td rowSpan={numShifts} style={td}>
                          {staff.code}
                        </td>
                        <td rowSpan={numShifts} style={{ ...td, ...tdLeft }}>
                          {staff.name}
                        </td>
                        <td rowSpan={numShifts} style={td}>
                          {STAFF_POSITION[staff.position] ?? ''}
                        </td>
                      </>
                    )}
                  </>
                )}

                {/* Ca label */}
                <td style={td}>
                  <div style={{ fontWeight: 600, fontSize: '8px' }}>{shiftEntry.shift.name}</div>
                  <div style={{ fontSize: '7px', color: '#6b7280' }}>
                    {shiftEntry.shift.startTime?.slice(0, 5)} -{' '}
                    {shiftEntry.shift.endTime?.slice(0, 5)}
                  </div>
                </td>

                {/* Day cells */}
                {colDays.map((d) => {
                  const dateStr = isGrid
                    ? (d as ReturnType<typeof getDaysInMonth>[number]).date
                    : dayjs(
                        new Date(
                          year,
                          month,
                          (d as ReturnType<typeof getWeeksInMonth>[number]['days'][number]).day,
                        ),
                      ).format('YYYY-MM-DD');
                  const workDay = shiftEntry.days[dateStr];
                  return (
                    <td key={dateStr} style={td}>
                      {workDay?.displayCode ?? ''}
                    </td>
                  );
                })}

                {/* Summary (first shift row only) */}
                {isFirst
                  ? SUMMARY_COLS.map(({ key }) => (
                      <td key={key} rowSpan={numShifts} style={td}>
                        {totalSummary[key] ?? ''}
                      </td>
                    ))
                  : null}
              </tr>
            );
          });
        })}
      </tbody>
    </table>
  );
}

// ─── HourlyPayroll print ──────────────────────────────────────────────────────

function HourlyPayrollPrintTable({
  data,
  year,
  month,
  isGrid,
}: {
  data: AttendanceByHoursResponse[];
  year: number;
  month: number;
  isGrid: boolean;
}) {
  const weeks = getWeeksInMonth(year, month);
  const allDays = weeks.flatMap((w) => w.days);
  const days = getDaysInMonth(year, month);
  const colDays = isGrid ? days : allDays;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '16px' }} />
        {isGrid ? (
          <>
            <col style={{ width: '50px' }} />
            <col style={{ width: '80px' }} />
            <col style={{ width: '70px' }} />
            <col style={{ width: '50px' }} />
            <col style={{ width: '40px' }} />
          </>
        ) : (
          <>
            <col style={{ width: '60px' }} />
            <col style={{ width: '50px' }} />
            <col style={{ width: '70px' }} />
            <col style={{ width: '40px' }} />
          </>
        )}
        {colDays.map((_, i) => (
          <col key={i} style={{ width: `${Math.floor(420 / colDays.length)}px` }} />
        ))}
        <col style={{ width: '36px' }} />
      </colgroup>

      <thead>
        {!isGrid && (
          <tr>
            <th colSpan={5} style={thTitle} />
            {weeks.map((week) => (
              <th key={week.weekNumber} colSpan={week.days.length} style={thWeek}>
                T{week.weekNumber}: {week.startDay}/{month + 1}-{week.endDay}/{month + 1}
              </th>
            ))}
            <th style={thWeek}>Tổng</th>
          </tr>
        )}

        <tr>
          <th style={thDay}>STT</th>
          {isGrid ? (
            <>
              <th style={thDay}>Mã NV</th>
              <th style={thDay}>Họ và tên</th>
              <th style={thDay}>Khoa/Phòng</th>
              <th style={thDay}>Phòng</th>
              <th style={thDay}>Chức vụ</th>
            </>
          ) : (
            <>
              <th style={thDay}>Khoa/phòng</th>
              <th style={thDay}>Mã NV</th>
              <th style={thDay}>Họ và tên</th>
              <th style={thDay}>Chức vụ</th>
            </>
          )}
          {colDays.map((d) => {
            const date = isGrid
              ? (d as ReturnType<typeof getDaysInMonth>[number]).date
              : dayjs(
                  new Date(
                    year,
                    month,
                    (d as ReturnType<typeof getWeeksInMonth>[number]['days'][number]).day,
                  ),
                ).format('YYYY-MM-DD');
            const dow = isGrid
              ? (d as ReturnType<typeof getDaysInMonth>[number]).dayOfWeek
              : (d as ReturnType<typeof getWeeksInMonth>[number]['days'][number]).dayOfWeek;
            const label = isGrid
              ? dayjs(date).format('D/M')
              : `${(d as ReturnType<typeof getWeeksInMonth>[number]['days'][number]).day}/${month + 1}`;
            return (
              <th key={date} style={thDay}>
                <div>{DAY_SHORT[dow]}</div>
                <div>{label}</div>
              </th>
            );
          })}
          <th style={thDay}>Tổng giờ</th>
        </tr>
      </thead>

      <tbody>
        {data.map((record, idx) => {
          const isEven = idx % 2 === 0;
          const td = isEven ? tdEven : tdOdd;

          return (
            <tr key={record.staffId}>
              <td style={td}>{idx + 1}</td>
              {isGrid ? (
                <>
                  <td style={td}>{record.staffCode}</td>
                  <td style={{ ...td, ...tdLeft }}>{record.staffName}</td>
                  <td style={{ ...td, ...tdLeft }}>
                    {record.departments?.map((d) => d.name).join(', ')}
                  </td>
                  <td style={{ ...td, ...tdLeft }}>
                    {record.rooms?.map((r) => r.name).join(', ')}
                  </td>
                  <td style={td}>{record.position}</td>
                </>
              ) : (
                <>
                  <td style={{ ...td, ...tdLeft }}>
                    {record.departments?.map((d) => d.name).join(', ')}
                  </td>
                  <td style={td}>{record.staffCode}</td>
                  <td style={{ ...td, ...tdLeft }}>{record.staffName}</td>
                  <td style={td}>{record.position}</td>
                </>
              )}
              {colDays.map((d) => {
                const dateStr = isGrid
                  ? (d as ReturnType<typeof getDaysInMonth>[number]).date
                  : dayjs(
                      new Date(
                        year,
                        month,
                        (d as ReturnType<typeof getWeeksInMonth>[number]['days'][number]).day,
                      ),
                    ).format('YYYY-MM-DD');
                const entry = record.days[dateStr];
                return (
                  <td key={dateStr} style={td}>
                    {entry?.hours != null ? entry.hours : ''}
                  </td>
                );
              })}
              <td style={{ ...td, fontWeight: 600 }}>{record.totalHours ?? ''}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// ─── DetailedTimeSheet print ──────────────────────────────────────────────────

function DetailedTimeSheetPrintTable({ data }: { data: DetailsTimeSheetRecord[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '16px' }} />
        <col style={{ width: '50px' }} />
        <col style={{ width: '80px' }} />
        <col style={{ width: '60px' }} />
        <col style={{ width: '50px' }} />
        <col style={{ width: '40px' }} />
        {DETAIL_COLS.map((c) => (
          <col key={c.key} style={{ width: c.key === 'date' ? '55px' : '38px' }} />
        ))}
      </colgroup>

      <thead>
        <tr>
          <th style={thTitle}>STT</th>
          <th style={thTitle}>Mã NV</th>
          <th style={thTitle}>Họ và tên</th>
          <th style={thTitle}>Khoa/Phòng</th>
          <th style={thTitle}>Phòng</th>
          <th style={thTitle}>Chức vụ</th>
          {DETAIL_COLS.map((c) => (
            <th key={c.key} style={thDay}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((record, staffIdx) => {
          const { staff, days } = record;
          const isEven = staffIdx % 2 === 0;
          const td = isEven ? tdEven : tdOdd;
          const numDays = Math.max(days.length, 1);

          return days.map((day, dayIdx) => {
            const isFirst = dayIdx === 0;
            return (
              <tr key={`${staff.code}-${day.date}`}>
                {isFirst && (
                  <>
                    <td rowSpan={numDays} style={td}>
                      {staffIdx + 1}
                    </td>
                    <td rowSpan={numDays} style={td}>
                      {staff.code}
                    </td>
                    <td rowSpan={numDays} style={{ ...td, ...tdLeft }}>
                      {staff.name}
                    </td>
                    <td rowSpan={numDays} style={{ ...td, ...tdLeft }}>
                      {staff.department}
                    </td>
                    <td rowSpan={numDays} style={{ ...td, ...tdLeft }}>
                      {staff.room}
                    </td>
                    <td rowSpan={numDays} style={td}>
                      {staff.position}
                    </td>
                  </>
                )}
                {DETAIL_COLS.map((col) => (
                  <td key={col.key} style={td}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(col.fmt as (v: any) => unknown)(day[col.key as keyof typeof day])}
                  </td>
                ))}
              </tr>
            );
          });
        })}
      </tbody>
    </table>
  );
}

// ─── Props & title map ────────────────────────────────────────────────────────

type TimekeepingPrintData =
  | { tab: TAB_KEYS.WORKSHEET_BY_SHIFT; data: WorkSheetByShiftType[] }
  | { tab: TAB_KEYS.HOURLY_PAYROLL; data: AttendanceByHoursResponse[] }
  | { tab: TAB_KEYS.DETAILED_TIME_SHEET; data: DetailsTimeSheetRecord[] };

type TimekeepingManagementPrintProps = TimekeepingPrintData & {
  year: number;
  month: number;
  layout: LayoutSwitcherEnum;
};

const TAB_TITLE: Record<TAB_KEYS, string> = {
  [TAB_KEYS.WORKSHEET_BY_SHIFT]: 'BẢNG CHẤM CÔNG THEO CA',
  [TAB_KEYS.HOURLY_PAYROLL]: 'BẢNG CÔNG GIỜ',
  [TAB_KEYS.DETAILED_TIME_SHEET]: 'BẢNG CHẤM CÔNG CHI TIẾT',
};

// ─── Main component ───────────────────────────────────────────────────────────

export const TimekeepingManagementPrint = forwardRef<
  HTMLDivElement,
  TimekeepingManagementPrintProps
>(({ tab, data, year, month, layout }, ref) => {
  const isGrid = layout === LayoutSwitcherEnum.GRID;

  const renderTable = () => {
    if (tab === TAB_KEYS.WORKSHEET_BY_SHIFT) {
      return (
        <WorkSheetByShiftPrintTable
          data={data as WorkSheetByShiftType[]}
          year={year}
          month={month}
          isGrid={isGrid}
        />
      );
    }
    if (tab === TAB_KEYS.HOURLY_PAYROLL) {
      return (
        <HourlyPayrollPrintTable
          data={data as AttendanceByHoursResponse[]}
          year={year}
          month={month}
          isGrid={isGrid}
        />
      );
    }
    if (tab === TAB_KEYS.DETAILED_TIME_SHEET) {
      return <DetailedTimeSheetPrintTable data={data as DetailsTimeSheetRecord[]} />;
    }
    return null;
  };

  return (
    <div ref={ref}>
      <PrintStyle />
      <div
        className="timekeeping-print-wrap"
        style={{
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: '9px',
          color: '#111',
          padding: '16px',
        }}
      >
        {/* Title */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '13px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            background: '#374151',
            color: '#fff',
            padding: '5px 0',
            marginBottom: '6px',
          }}
        >
          {TAB_TITLE[tab]} THÁNG {month + 1} NĂM {year}
        </div>

        {renderTable()}

        <SignatureFooter />
      </div>
    </div>
  );
});

TimekeepingManagementPrint.displayName = 'TimekeepingManagementPrint';
