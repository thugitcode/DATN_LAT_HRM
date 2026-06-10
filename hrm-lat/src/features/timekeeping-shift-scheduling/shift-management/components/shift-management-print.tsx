import { forwardRef, useMemo, type CSSProperties } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { StaffSchedule } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';

import { getDaysInMonth, getWeeksInMonth } from '../../helper';
import { getStaffPosition } from '../constants/data';

const DAY_SHORT: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

const COLOR = {
  headerBg: '#374151',
  weekBg: '#BFDBFE',
  dayNumBg: '#93C5FD',
  dayNameBg: '#DBEAFE',
  headerText: '#1E3A5F',
  border: '#D1D5DB',
  rowEven: '#FFFFFF',
  rowOdd: '#F9FAFB',
};

interface ShiftManagementPrintProps {
  data: StaffSchedule[];
  monthQuery?: string;
  layout: LayoutSwitcherEnum;
  departmentName?: string;
}

export const ShiftManagementPrint = forwardRef<HTMLDivElement, ShiftManagementPrintProps>(
  ({ data, monthQuery, layout, departmentName = '' }, ref) => {
    const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
    const staffPosition = useMemo(() => getStaffPosition(t), [t]);

    const current = monthQuery ? dayjs(monthQuery) : dayjs();
    const year = current.year();
    const month = current.month();

    const weeks = getWeeksInMonth(year, month);
    const allDays = weeks.flatMap((w) => w.days);
    const days = getDaysInMonth(year, month);
    const isGrid = layout === LayoutSwitcherEnum.GRID;

    const borderStyle = `1px solid ${COLOR.border}`;

    const thBase: CSSProperties = {
      border: borderStyle,
      textAlign: 'center',
      verticalAlign: 'middle',
      padding: '2px',
      fontSize: '9px',
      fontWeight: 'bold',
      color: COLOR.headerText,
    };

    const thWeek: CSSProperties = { ...thBase, backgroundColor: COLOR.weekBg };
    const thDayNum: CSSProperties = { ...thBase, backgroundColor: COLOR.dayNumBg };
    const thDayName: CSSProperties = { ...thBase, backgroundColor: COLOR.dayNameBg };

    const tdBase: CSSProperties = {
      border: borderStyle,
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

    const tableStyle: CSSProperties = {
      width: '100%',
      borderCollapse: 'collapse',
      tableLayout: 'fixed',
    };

    const renderGridThead = () => (
      <thead>
        <tr>
          <th colSpan={5} style={thWeek} />
          <th colSpan={days.length} style={thWeek}>
            {t('print.month_year', { month: month + 1, year })}
          </th>
        </tr>
        <tr>
          <th style={thDayNum}>{t('columns.stt')}</th>
          <th style={thDayNum}>{t('print.employee_code_short')}</th>
          <th style={thDayNum}>{t('print.full_name')}</th>
          <th style={thDayNum}>{t('print.department')}</th>
          <th style={thDayNum}>{t('print.position')}</th>
          {days.map((d) => (
            <th key={d.date} style={thDayNum}>
              {dayjs(d.date).date()}
            </th>
          ))}
        </tr>
        <tr>
          <th style={thDayName} />
          <th style={thDayName} />
          <th style={thDayName} />
          <th style={thDayName} />
          <th style={thDayName} />
          {days.map((d) => (
            <th key={d.date} style={thDayName}>
              {DAY_SHORT[d.dayOfWeek]}
            </th>
          ))}
        </tr>
      </thead>
    );

    const renderWeekThead = () => (
      <thead>
        <tr>
          <th rowSpan={3} style={thWeek}>
            {t('columns.stt')}
          </th>
          <th rowSpan={3} style={thWeek}>
            {t('print.employee_code_short')}
          </th>
          <th rowSpan={3} style={thWeek}>
            {t('print.full_name')}
          </th>
          <th rowSpan={3} style={thWeek}>
            {t('print.position')}
          </th>
          {weeks.map((week) => (
            <th key={week.weekNumber} colSpan={week.days.length} style={thWeek}>
              {t('columns.week', { week: week.weekNumber })}: {week.startDay}/{month + 1} -{' '}
              {week.endDay}/{month + 1}
            </th>
          ))}
        </tr>
        <tr>
          {allDays.map((day) => (
            <th key={`num-${day.day}`} style={thDayNum}>
              {day.day}
            </th>
          ))}
        </tr>
        <tr>
          {allDays.map((day) => (
            <th key={`name-${day.day}`} style={thDayName}>
              {DAY_SHORT[day.dayOfWeek]}
            </th>
          ))}
        </tr>
      </thead>
    );

    return (
      <div ref={ref}>
        <style>{`
          @media print {
            body, html { margin: 0; padding: 0; }
            body * { visibility: hidden; }
            .shift-print-wrap, .shift-print-wrap * { visibility: visible; }
            .shift-print-wrap {
              position: absolute;
              top: 0; left: 0;
              width: 100%;
              padding: 6mm 8mm;
              box-sizing: border-box;
              background: white;
            }
            @page { size: A4 landscape; margin: 10mm 8mm; }
            thead { display: table-header-group; }
            .staff-tbody { page-break-inside: avoid; break-inside: avoid; }
          }
        `}</style>

        <div
          className="shift-print-wrap"
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: '9px',
            color: '#111',
            padding: '16px',
          }}
        >
          {/* ── Header: đồng bộ Excel ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            {/* Góc trái */}
            <div style={{ lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold', fontSize: '10px' }}>
                {t('print.company_name_1')}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '10px' }}>
                {t('print.company_name_2')}
              </div>
            </div>

            {/* Góc phải – tiêu đề + khoa */}
            <div style={{ textAlign: 'center', flex: 1, paddingLeft: '16px' }}>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {t('print.title', { month: month + 1, year })}
              </div>
              {departmentName && (
                <div style={{ fontSize: '10px', marginTop: '2px' }}>
                  {t('print.department_label')}: <strong>{departmentName}</strong>
                </div>
              )}
            </div>

            {/* Placeholder cân bằng bên phải */}
            <div style={{ minWidth: '120px' }} />
          </div>

          {/* ── Bảng ── */}
          {isGrid ? (
            <table style={tableStyle}>
              <colgroup>
                <col style={{ width: '22px' }} />
                <col style={{ width: '40px' }} />
                <col style={{ width: '40px' }} />
                <col style={{ width: '40px' }} />
                <col style={{ width: '40px' }} />
                {days.map((_, i) => (
                  <col key={i} style={{ width: `${Math.floor(450 / days.length)}px` }} />
                ))}
              </colgroup>
              {renderGridThead()}
              {data.map((record, idx) => {
                const { staff, schedules = [] } = record;
                const maxSlots = Math.max(
                  1,
                  ...days.map((d) => schedules.find((s) => s.date === d.date)?.shifts?.length ?? 0),
                );
                const td = idx % 2 === 0 ? tdEven : tdOdd;
                return (
                  <tbody key={staff.id} className="staff-tbody">
                    {Array.from({ length: maxSlots }).flatMap((_, slotIdx) => [
                      <tr key={`${staff.id}-${slotIdx}-name`}>
                        {slotIdx === 0 && (
                          <>
                            <td rowSpan={maxSlots * 2} style={td}>
                              {idx + 1}
                            </td>
                            <td rowSpan={maxSlots * 2} style={td}>
                              {staff.code}
                            </td>
                            <td rowSpan={maxSlots * 2} style={{ ...td, ...tdLeft }}>
                              {staff.name}
                            </td>
                            <td rowSpan={maxSlots * 2} style={{ ...td, ...tdLeft }}>
                              {staff.departments?.map((d) => d.name).join(', ')}
                            </td>
                            <td rowSpan={maxSlots * 2} style={td}>
                              {staffPosition[staff.position ?? ''] ?? ''}{' '}
                            </td>
                          </>
                        )}
                        {days.map((d) => {
                          const shift = schedules.find((s) => s.date === d.date)?.shifts?.[slotIdx];
                          return (
                            <td key={d.date} style={td}>
                              {shift && (
                                <div style={{ fontWeight: 600 }}>{shift.shiftTemplateName}</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>,
                      <tr key={`${staff.id}-${slotIdx}-time`}>
                        {days.map((d) => {
                          const shift = schedules.find((s) => s.date === d.date)?.shifts?.[slotIdx];
                          return (
                            <td key={d.date} style={td}>
                              {shift && (
                                <div style={{ fontSize: '8px', color: '#374151' }}>
                                  {shift.startTime?.slice(0, 5)} - {shift.endTime?.slice(0, 5)}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>,
                    ])}
                  </tbody>
                );
              })}
            </table>
          ) : (
            <table style={tableStyle}>
              <colgroup>
                <col style={{ width: '16px' }} />
                <col style={{ width: '34px' }} />
                <col style={{ width: '40px' }} />
                <col style={{ width: '30px' }} />
                {allDays.map((_, i) => (
                  <col key={i} style={{ width: `${Math.floor(470 / allDays.length)}px` }} />
                ))}
              </colgroup>
              {renderWeekThead()}
              {data.map((record, idx) => {
                const { staff, schedules = [] } = record;
                const maxSlots = Math.max(
                  1,
                  ...allDays.map((day) => {
                    const dateStr = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
                    return schedules.find((s) => s.date === dateStr)?.shifts?.length ?? 0;
                  }),
                );
                const td = idx % 2 === 0 ? tdEven : tdOdd;
                return (
                  <tbody key={staff.id} className="staff-tbody">
                    {Array.from({ length: maxSlots }).flatMap((_, slotIdx) => [
                      <tr key={`${staff.id}-${slotIdx}-name`}>
                        {slotIdx === 0 && (
                          <>
                            <td rowSpan={maxSlots * 2} style={td}>
                              {idx + 1}
                            </td>
                            <td rowSpan={maxSlots * 2} style={td}>
                              {staff.code}
                            </td>
                            <td rowSpan={maxSlots * 2} style={{ ...td, ...tdLeft }}>
                              {staff.name}
                            </td>
                            <td rowSpan={maxSlots * 2} style={td}>
                              {staffPosition[staff.position ?? ''] ?? ''}{' '}
                            </td>
                          </>
                        )}
                        {allDays.map((day) => {
                          const dateStr = dayjs(new Date(year, month, day.day)).format(
                            'YYYY-MM-DD',
                          );
                          const shift = schedules.find((s) => s.date === dateStr)?.shifts?.[
                            slotIdx
                          ];
                          return (
                            <td key={day.day} style={td}>
                              {shift && (
                                <div style={{ fontWeight: 600 }}>{shift.shiftTemplateName}</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>,
                      <tr key={`${staff.id}-${slotIdx}-time`}>
                        {allDays.map((day) => {
                          const dateStr = dayjs(new Date(year, month, day.day)).format(
                            'YYYY-MM-DD',
                          );
                          const shift = schedules.find((s) => s.date === dateStr)?.shifts?.[
                            slotIdx
                          ];
                          return (
                            <td key={day.day} style={td}>
                              {shift && (
                                <div style={{ fontSize: '8px', color: '#374151' }}>
                                  {shift.startTime?.slice(0, 5)} - {shift.endTime?.slice(0, 5)}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>,
                    ])}
                  </tbody>
                );
              })}
            </table>
          )}

          {/* ── Footer ── */}
          <div style={{ marginTop: '16px' }}>
            <div
              style={{
                textAlign: 'right',
                paddingRight: '8%',
                fontSize: '10px',
                marginBottom: '4px',
              }}
            >
              ….............., ngày __ tháng __ năm {year}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              {['Trưởng Đơn Vị', 'TL. Hành chánh - Nhân sự', 'Lập Bảng'].map((title) => (
                <div key={title} style={{ width: '30%', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '10px', marginBottom: '28px' }}>
                    {title}
                  </div>
                  <div style={{ fontStyle: 'italic', fontSize: '9px' }}>(Ký, họ tên)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

ShiftManagementPrint.displayName = 'ShiftManagementPrint';
