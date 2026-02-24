import { useMemo, useState, type FC } from 'react';
import { Accordion, AccordionItem } from '@heroui/react';
import dayjs from 'dayjs';

import { useYearMonth } from '@/features/timekeeping-shift-scheduling/hooks/use-year-month';

import { getDaysInMonth } from '../../../helper';
import { ROW_GAP, ROW_H, ROW_PY, STAFF_COL_W } from '../../constants/constants';
import type { StaffRow } from '../../types/type';
import { ScheduleBlock } from './schedule-block';
import type { ShiftManagementGridProps } from './shift-management-grid';
import { StaffInfo } from './staff-infor';

// function buildMockRows(days: DayColumn[]): StaffRow[] {
//   const types: ShiftType[] = ['main', 'alternate', 'direct', 'flexible'];
//   return Array.from({ length: 4 }, (_, si) => ({
//     id: String(si + 1),
//     name: 'Cẩn Văn Đạt',
//     role: 'Bác sĩ',
//     code: 'KTH899',
//     department: 'Khoa Tai mũi họng',
//     scheduleRows: types.map((type, ri) =>
//       days.map((d, di) => {
//         if (isWeekend(d.dayOfWeek)) return null;
//         return (di + ri) % 4 !== 3 ? { code: 'HC001', time: '07:00-17:30', type } : null;
//       }),
//     ),
//   }));
// }

export const Body: FC<Readonly<ShiftManagementGridProps>> = ({ data }) => {
  const { month, year } = useYearMonth();

  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(['1', '2']));
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  const rows: StaffRow[] = !data?.length
    ? []
    : data.map((item) => ({
        id: item.staff.id,
        name: item.staff.name,
        role: item.staff.position,
        code: item.staff.code,
        department: '',
        scheduleRows: [
          days.map((d) => {
            const dateStr = dayjs(`${year}-${month}-${d.day}`).format('YYYY-MM-DD');
            const schedule = item.schedules.find((s) => s.date === dateStr);
            if (!schedule || !schedule.shifts.length) return null;

            const shift = schedule.shifts[0];

            return {
              code: shift?.shiftTemplateCode ?? '',
              time: `${shift?.startTime.slice(0, 5)}-${shift?.endTime.slice(0, 5)}`,
              type: shift?.shiftTemplateType,
              name: shift?.shiftTemplateName,
            };
          }),
        ],
      }));

  const handleSelectionChange = (keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') {
      setSelectedKeys(new Set(rows.map((r) => r.id)));
    } else {
      setSelectedKeys(new Set(Array.from(keys).map(String)));
    }
  };

  return (
    <div className="flex flex-1">
      <div
        className="shrink-0 border-r border-[#E4E4E7]"
        style={{ width: STAFF_COL_W }}
        id="left-panel"
      >
        <Accordion
          selectionMode="multiple"
          selectedKeys={selectedKeys}
          onSelectionChange={handleSelectionChange}
          showDivider={false}
          className="p-0"
          itemClasses={{
            base: 'border-b border-[#F4F4F5] rounded-none px-0 shadow-none',
            trigger: [
              'px-3 gap-2 rounded-none',
              'data-[hover=true]:bg-[#F4F4F5]/60',
              'transition-colors duration-150',
              `py-[${ROW_PY}px]`,
            ].join(' '),
            indicator:
              'text-[#A1A1AA] data-[open=true]:rotate-90 data-[open=true]:text-[#3B82F6] text-base transition-transform duration-200',
            content: 'p-0',
            title: 'p-0',
            heading: 'p-0',
          }}
        >
          {rows.map((staff) => (
            <AccordionItem
              key={staff.id}
              aria-label={staff.name}
              title={<StaffInfo staff={staff} />}
              classNames={{
                titleWrapper: 'py-3 w-full overflow-hidden',
              }}
            >
              <div
                style={{
                  height:
                    (staff.scheduleRows.length - 1) * ROW_H +
                    (staff.scheduleRows.length - 1) * ROW_GAP,
                }}
              />
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="flex-1 " id="right-panel">
        {rows.map((staff) => (
          <ScheduleBlock
            key={staff.id}
            staff={staff}
            days={days}
            expanded={selectedKeys.has(staff.id)}
          />
        ))}
      </div>
    </div>
  );
};
