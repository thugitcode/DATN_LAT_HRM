import { forwardRef, type CSSProperties } from 'react';
import dayjs from 'dayjs';

import type { StaffSchedule } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';

import { getDaysInMonth, getWeeksInMonth } from '../../helper';
import { STAFF_POSITION } from '../constants/data';

const DAY_SHORT: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

interface ShiftManagementPrintProps {
  data: StaffSchedule[];
  monthQuery?: string;
  layout: LayoutSwitcherEnum;
}

export const ShiftManagementPrint = forwardRef<HTMLDivElement, ShiftManagementPrintProps>(
  ({ data, monthQuery, layout }, ref) => {
    const current = monthQuery ? dayjs(monthQuery) : dayjs();
    const year = current.year();
    const month = current.month();

    const weeks = getWeeksInMonth(year, month);
    const allDays = weeks.flatMap((w) => w.days);
    const days = getDaysInMonth(year, month);
    const isGrid = layout === LayoutSwitcherEnum.GRID;

    const thTitleStyle: CSSProperties = {
      backgroundColor: '#374151',
      color: '#fff',
      fontWeight: 'bold',
      border: '1px solid #9ca3af',
      textAlign: 'center',
      verticalAlign: 'middle',
      padding: '2px',
    };
    const thWeekStyle: CSSProperties = {
      backgroundColor: '#6b7280',
      color: '#fff',
      fontWeight: 'bold',
      border: '1px solid #9ca3af',
      textAlign: 'center',
      verticalAlign: 'middle',
      padding: '2px',
    };
    const thDayStyle: CSSProperties = {
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

    return (
      <div ref={ref}>
        <style>{`@media print {
          body * { visibility: hidden; }
          .shift-print-wrap, .shift-print-wrap * { visibility: visible; }
          .shift-print-wrap { position: fixed; inset: 0; padding: 8mm 10mm; background: white; }
          @page { size: A3 landscape; margin: 0; }
        }`}</style>

        <div
          className="shift-print-wrap"
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: '9px',
            color: '#111',
            padding: '16px',
          }}
        >
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
            BẢNG PHÂN CA THÁNG {month + 1} NĂM {year}
          </div>

          {isGrid ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '22px' }} />
                <col style={{ width: '60px' }} />
                <col style={{ width: '90px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '50px' }} />
                {days.map((_, i) => (
                  <col key={i} style={{ width: `${Math.floor(450 / days.length)}px` }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th style={thDayStyle}>STT</th>
                  <th style={thDayStyle}>Mã NV</th>
                  <th style={thDayStyle}>Họ và tên</th>
                  <th style={thDayStyle}>Khoa/Phòng</th>
                  <th style={thDayStyle}>Chức vụ</th>
                  {days.map((d) => (
                    <th key={d.date} style={thDayStyle}>
                      <div>{DAY_SHORT[d.dayOfWeek]}</div>
                      <div>{dayjs(d.date).format('D/M')}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((record, idx) => {
                  const { staff, schedules = [] } = record;
                  const maxSlots = Math.max(
                    1,
                    ...days.map(
                      (d) => schedules.find((s) => s.date === d.date)?.shifts?.length ?? 0,
                    ),
                  );
                  const isEven = idx % 2 === 0;
                  const td = isEven ? tdEven : tdOdd;

                  return Array.from({ length: maxSlots }).flatMap((_, slotIdx) => [
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
                            {STAFF_POSITION[staff.position ?? ''] ?? ''}
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
                  ]);
                })}
              </tbody>
            </table>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '16px' }} />
                <col style={{ width: '34px' }} />
                <col style={{ width: '40px' }} />
                <col style={{ width: '30px' }} />
                {allDays.map((_, i) => (
                  <col key={i} style={{ width: `${Math.floor(470 / allDays.length)}px` }} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th rowSpan={2} style={thTitleStyle}>
                    STT
                  </th>
                  <th rowSpan={2} style={thTitleStyle}>
                    Mã NV
                  </th>
                  <th rowSpan={2} style={thTitleStyle}>
                    Họ và tên
                  </th>
                  <th rowSpan={2} style={thTitleStyle}>
                    Chức vụ
                  </th>
                  {weeks.map((week) => (
                    <th key={week.weekNumber} colSpan={week.days.length} style={thWeekStyle}>
                      TUẦN {week.weekNumber}: {week.startDay}/{month + 1} - {week.endDay}/
                      {month + 1}
                    </th>
                  ))}
                </tr>
                <tr>
                  {allDays.map((day) => (
                    <th key={day.day} style={thDayStyle}>
                      <div>{DAY_SHORT[day.dayOfWeek]}</div>
                      <div>
                        {day.day}/{month + 1}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((record, idx) => {
                  const { staff, schedules = [] } = record;
                  const maxSlots = Math.max(
                    1,
                    ...allDays.map((day) => {
                      const dateStr = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
                      return schedules.find((s) => s.date === dateStr)?.shifts?.length ?? 0;
                    }),
                  );
                  const isEven = idx % 2 === 0;
                  const td = isEven ? tdEven : tdOdd;

                  return Array.from({ length: maxSlots }).flatMap((_, slotIdx) => [
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
                            {STAFF_POSITION[staff.position ?? ''] ?? ''}
                          </td>
                        </>
                      )}
                      {allDays.map((day) => {
                        const dateStr = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
                        const shift = schedules.find((s) => s.date === dateStr)?.shifts?.[slotIdx];
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
                        const dateStr = dayjs(new Date(year, month, day.day)).format('YYYY-MM-DD');
                        const shift = schedules.find((s) => s.date === dateStr)?.shifts?.[slotIdx];
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
                  ]);
                })}
              </tbody>
            </table>
          )}

          {/* Chữ ký */}
          <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
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
    );
  },
);

ShiftManagementPrint.displayName = 'ShiftManagementPrint';

ShiftManagementPrint.displayName = 'ShiftManagementPrint';
