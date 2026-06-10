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

// Match ShiftManagementPrint COLOR palette
const COLOR = {
  headerBg: '#374151',
  weekBg: '#BFDBFE',
  dayNumBg: '#93C5FD',
  dayNameBg: '#DBEAFE',
  headerText: '#1E3A5F',
  border: '#D1D5DB',
  rowEven: '#FFFFFF',
  rowOdd: '#F9FAFB',
  titleText: '#fff',
  summaryBg: '#F0F1FF',
};

const thTitle: CSSProperties = {
  backgroundColor: COLOR.headerBg,
  color: COLOR.titleText,
  fontWeight: 'bold',
  border: `1px solid ${COLOR.border}`,
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: '2px',
};
const thWeek: CSSProperties = {
  backgroundColor: COLOR.weekBg,
  color: COLOR.headerText,
  fontWeight: 'bold',
  border: `1px solid ${COLOR.border}`,
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: '2px',
};
const thDay: CSSProperties = {
  backgroundColor: COLOR.dayNumBg,
  color: COLOR.headerText,
  fontWeight: 'bold',
  border: `1px solid ${COLOR.border}`,
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: '2px',
  fontSize: '9px',
};
const tdBase: CSSProperties = {
  border: `1px solid ${COLOR.border}`,
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: '2px',
  wordBreak: 'break-word',
  lineHeight: '1.3',
  fontSize: '9px',
};
const tdEven: CSSProperties = { ...tdBase, backgroundColor: COLOR.rowEven };
const tdOdd: CSSProperties = { ...tdBase, backgroundColor: COLOR.rowOdd };
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

const SignatureFooter = ({ year }: { year: number }) => (
  <div style={{ marginTop: '16px' }}>
    <div
      style={{
        textAlign: 'right',
        paddingRight: '8%',
        fontSize: '10px',
        marginBottom: '4px',
        fontStyle: 'italic',
      }}
    >
      ….............., ngày __ tháng __ năm {year}
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
      {['Trưởng Đơn Vị', 'TL. Hành chánh - Nhân sự', 'Lập Bảng'].map((title) => (
        <div key={title} style={{ width: '30%', textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '28px' }}>{title}</div>
          <div style={{ fontStyle: 'italic', fontSize: '9px' }}>(Ký, họ tên)</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── Page Header ──────────────────────────────────────────────────────────────

const PageHeader = ({
  title,
  month,
  year,
  departmentName,
}: {
  title: string;
  month: number;
  year: number;
  departmentName?: string;
}) => (
  <div
    className="print-page-header"
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '6px',
      alignItems: 'flex-start',
    }}
  >
    {/* Left – company info */}
    <div style={{ lineHeight: '1.6' }}>
      <div style={{ fontWeight: 'bold', fontSize: '10px' }}>BỆNH VIỆN ĐA KHOA</div>
      <div style={{ fontWeight: 'bold', fontSize: '10px' }}>TRUNG TÂM Y TẾ</div>
    </div>

    {/* Center – title */}
    <div style={{ textAlign: 'center', flex: 1, paddingLeft: '16px' }}>
      <div
        style={{
          fontWeight: 'bold',
          fontSize: '13px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {title} THÁNG {month + 1} NĂM {year}
      </div>
      {departmentName && (
        <div style={{ fontSize: '10px', marginTop: '2px' }}>
          Khoa/Phòng: <strong>{departmentName}</strong>
        </div>
      )}
    </div>

    {/* Right placeholder */}
    <div style={{ minWidth: '120px' }} />
  </div>
);

// ─── Print style ──────────────────────────────────────────────────────────────

const PrintStyle = () => (
  <style>{`
    @media print {
      body, html { margin: 0; padding: 0; }
      body * { visibility: hidden; }
      .timekeeping-print-wrap, .timekeeping-print-wrap * { visibility: visible; }
      .timekeeping-print-wrap {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        padding: 6mm 8mm;
        box-sizing: border-box;
        background: white;
      }
      @page {
        size: A4 landscape;
        margin: 10mm 8mm;
      }

      /* Allow table to break across pages */
      table {
        page-break-inside: auto;
      }
      /* Repeat thead on every page */
      thead {
        display: table-header-group;
      }
      tfoot {
        display: table-footer-group;
      }
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  `}</style>
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
            <th colSpan={6} style={thWeek} />
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
              <tr key={`${staff.id}-${shiftIdx}`} style={{ pageBreakInside: 'avoid' }}>
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

                <td style={td}>
                  <div style={{ fontWeight: 600, fontSize: '8px' }}>{shiftEntry.shift.name}</div>
                  <div style={{ fontSize: '7px', color: '#6b7280' }}>
                    {shiftEntry.shift.startTime?.slice(0, 5)} -{' '}
                    {shiftEntry.shift.endTime?.slice(0, 5)}
                  </div>
                </td>

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

                {isFirst
                  ? SUMMARY_COLS.map(({ key }) => (
                      <td
                        key={key}
                        rowSpan={numShifts}
                        style={{ ...td, backgroundColor: COLOR.summaryBg, fontWeight: 600 }}
                      >
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
            <th colSpan={5} style={thWeek} />
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
          <th style={{ ...thDay, backgroundColor: COLOR.summaryBg, color: COLOR.headerText }}>
            Tổng giờ
          </th>
        </tr>
      </thead>

      <tbody>
        {data.map((record, idx) => {
          const isEven = idx % 2 === 0;
          const td = isEven ? tdEven : tdOdd;

          return (
            <tr key={record.staffId} style={{ pageBreakInside: 'avoid' }}>
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
              <td style={{ ...td, fontWeight: 600, backgroundColor: COLOR.summaryBg }}>
                {record.totalHours ?? ''}
              </td>
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
          <th style={thDay}>STT</th>
          <th style={thDay}>Mã NV</th>
          <th style={thDay}>Họ và tên</th>
          <th style={thDay}>Khoa/Phòng</th>
          <th style={thDay}>Phòng</th>
          <th style={thDay}>Chức vụ</th>
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
              <tr key={`${staff.code}-${day.date}`} style={{ pageBreakInside: 'avoid' }}>
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

type TimekeepingPrintData =
  | { tab: TAB_KEYS.WORKSHEET_BY_SHIFT; data: WorkSheetByShiftType[] }
  | { tab: TAB_KEYS.HOURLY_PAYROLL; data: AttendanceByHoursResponse[] }
  | { tab: TAB_KEYS.DETAILED_TIME_SHEET; data: DetailsTimeSheetRecord[] };

type TimekeepingManagementPrintProps = TimekeepingPrintData & {
  year: number;
  month: number;
  layout: LayoutSwitcherEnum;
  /** Optional department name to show in header subtitle */
  departmentName?: string;
};

const TAB_TITLE: Record<TAB_KEYS, string> = {
  [TAB_KEYS.WORKSHEET_BY_SHIFT]: 'BẢNG CHẤM CÔNG THEO CA',
  [TAB_KEYS.HOURLY_PAYROLL]: 'BẢNG CÔNG GIỜ',
  [TAB_KEYS.DETAILED_TIME_SHEET]: 'BẢNG CHẤM CÔNG CHI TIẾT',
};

export const TimekeepingManagementPrint = forwardRef<
  HTMLDivElement,
  TimekeepingManagementPrintProps
>(({ tab, data, year, month, layout, departmentName }, ref) => {
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
        {/* ── Header: đồng bộ với ShiftManagementPrint ── */}
        <PageHeader
          title={TAB_TITLE[tab]}
          month={month}
          year={year}
          departmentName={departmentName}
        />

        {/* ── Table ── */}
        {renderTable()}

        {/* ── Signature footer ── */}
        <SignatureFooter year={year} />
      </div>
    </div>
  );
});

TimekeepingManagementPrint.displayName = 'TimekeepingManagementPrint';
