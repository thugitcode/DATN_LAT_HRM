import { useMemo, useState, type FC } from 'react';
import { Accordion, AccordionItem } from '@heroui/react';

import type { StaffSchedule } from '@/types';

import { useYearMonth } from '../hooks/use-year-month';

// ─── Constants ────────────────────────────────────────────────────────────────

const COL_W = 96; // px — width of each day column
const ROW_H = 60; // px — height of one schedule row
const ROW_GAP = 4; // px — gap between rows
const ROW_PY = 8; // px — padding top/bottom of each staff block
const STAFF_COL_W = 220;

const VN_DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

// ─── Types ────────────────────────────────────────────────────────────────────

type ShiftType = 'main' | 'alternate' | 'direct' | 'flexible' | 'off';

interface ShiftCell {
  code: string;
  time: string;
  type: ShiftType;
}

interface DayColumn {
  day: number;
  dayOfWeek: number;
}

interface StaffRow {
  id: string;
  name: string;
  role: string;
  code: string;
  department: string;
  avatar?: string;
  /** One array per "schedule line" shown under this staff */
  scheduleRows: Array<Array<ShiftCell | null>>;
}

interface ShiftManagementGridProps {
  data?: StaffSchedule[];
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const SHIFT_COLORS: Record<ShiftType, string> = {
  main: 'bg-[#DBEAFE] text-[#1D4ED8] border-[#BFDBFE]',
  alternate: 'bg-[#FEF9C3] text-[#92400E] border-[#FDE68A]',
  direct: 'bg-[#EDE9FE] text-[#6D28D9] border-[#DDD6FE]',
  flexible: 'bg-[#DCFCE7] text-[#166534] border-[#BBF7D0]',
  off: 'bg-[#F4F4F5] text-[#A1A1AA] border-[#E4E4E7]',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): DayColumn[] {
  const count = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => ({
    day: i + 1,
    dayOfWeek: new Date(year, month, i + 1).getDay(),
  }));
}

function isWeekend(dow: number) {
  return dow === 0 || dow === 6;
}

/** Total pixel height of a staff block given how many rows are visible */
function calcBlockHeight(rowCount: number) {
  return ROW_PY * 2 + rowCount * ROW_H + Math.max(0, rowCount - 1) * ROW_GAP;
}

// ─── Mock data factory (replace with real `data` mapping) ────────────────────

function buildMockRows(days: DayColumn[]): StaffRow[] {
  const types: ShiftType[] = ['main', 'alternate', 'direct', 'flexible'];
  return Array.from({ length: 4 }, (_, si) => ({
    id: String(si + 1),
    name: 'Cẩn Văn Đạt',
    role: 'Bác sĩ',
    code: 'KTH899',
    department: 'Khoa Tai mũi họng',
    scheduleRows: types.map((type, ri) =>
      days.map((d, di) => {
        if (isWeekend(d.dayOfWeek)) return null;
        return (di + ri) % 4 !== 3 ? { code: 'HC001', time: '07:00-17:30', type } : null;
      }),
    ),
  }));
}

// ─── ShiftCellBlock ───────────────────────────────────────────────────────────

const ShiftCellBlock: FC<{ cell: ShiftCell | null; day: DayColumn }> = ({ cell, day }) => {
  const w = COL_W - 8;
  const h = ROW_H - 8;

  if (!cell) {
    return (
      <div
        className={`flex items-center justify-center rounded-lg border border-dashed border-[#D4D4D8]
          cursor-pointer hover:border-[#60A5FA] hover:bg-[#EFF6FF] transition-colors group
          ${isWeekend(day.dayOfWeek) ? 'bg-[#FAFAFA]' : 'bg-white'}`}
        style={{ width: w, height: h }}
      >
        <span className="text-[#D4D4D8] text-xl leading-none group-hover:text-[#60A5FA]">⊕</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border text-xs font-semibold
        cursor-pointer hover:opacity-80 transition-opacity select-none ${SHIFT_COLORS[cell.type]}`}
      style={{ width: w, height: h }}
    >
      <span className="font-bold tracking-wide">{cell.code}</span>
      <span className="font-normal opacity-75 text-[11px]">{cell.time}</span>
    </div>
  );
};

// ─── StaffInfo (Accordion title) ──────────────────────────────────────────────

const StaffInfo: FC<{ staff: StaffRow }> = ({ staff }) => (
  <div className="flex items-center gap-2 min-w-0 py-0.5">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#60A5FA] to-[#3B82F6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {staff.name
        .split(' ')
        .slice(-2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()}
    </div>
    <div className="min-w-0 text-left">
      <p className="text-sm font-semibold text-[#18181B] truncate leading-tight">{staff.name}</p>
      <p className="text-[11px] text-[#71717A] truncate">
        {staff.role} · {staff.code}
      </p>
      <p className="text-[11px] text-[#A1A1AA] truncate">{staff.department}</p>
    </div>
  </div>
);

// ─── ScheduleBlock (right panel per staff) ───────────────────────────────────

const ScheduleBlock: FC<{
  staff: StaffRow;
  days: DayColumn[];
  expanded: boolean;
}> = ({ staff, days, expanded }) => {
  const visibleRows = expanded ? staff.scheduleRows : staff.scheduleRows.slice(0, 1);

  return (
    <div
      className="flex flex-col border-b border-[#F4F4F5] transition-[height] duration-300 overflow-hidden"
      style={{
        height: calcBlockHeight(visibleRows.length),
        paddingTop: ROW_PY,
        paddingBottom: ROW_PY,
        gap: ROW_GAP,
      }}
    >
      {visibleRows.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-1 px-1">
          {days.map((d, dIdx) => (
            <div
              key={dIdx}
              className={`flex-shrink-0 flex items-center justify-center
                ${isWeekend(d.dayOfWeek) ? 'bg-[#FFFBEB]/40 rounded' : ''}`}
              style={{ width: COL_W }}
            >
              <ShiftCellBlock cell={row[dIdx] ?? null} day={d} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const ShiftManagementGrid: FC<ShiftManagementGridProps> = ({ data }) => {
  const { month, year } = useYearMonth();
  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);

  // TODO: replace mock with real data mapping
  const rows = useMemo(() => buildMockRows(days), [days]);

  // Shared expand state — drives both Accordion (left) and ScheduleBlock (right)
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set(['1', '2']));

  const handleSelectionChange = (keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') {
      setSelectedKeys(new Set(rows.map((r) => r.id)));
    } else {
      setSelectedKeys(new Set(Array.from(keys).map(String)));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-[#E4E4E7] overflow-hidden">
      {/* ─── Day header ─── */}
      <div className="flex flex-shrink-0 border-b border-[#E4E4E7] bg-[#FAFAFA] sticky top-0 z-10">
        {/* Blank staff col header */}
        <div className="flex-shrink-0 border-r border-[#E4E4E7]" style={{ width: STAFF_COL_W }} />

        {/* Day labels */}
        <div className="flex overflow-x-hidden">
          {days.map((d) => (
            <div
              key={d.day}
              className={`flex-shrink-0 flex flex-col items-center justify-end pb-2 pt-1 gap-0.5
                ${isWeekend(d.dayOfWeek) ? 'bg-[#FFF7ED]' : ''}`}
              style={{ width: COL_W }}
            >
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-[#A1A1AA] font-medium">
                  {VN_DAYS[d.dayOfWeek]}
                </span>
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-md leading-none
                  ${
                    isWeekend(d.dayOfWeek)
                      ? 'bg-[#FED7AA] text-[#C2410C]'
                      : 'bg-white border border-[#E4E4E7] text-[#52525B]'
                  }`}
                >
                  {d.day}
                </span>
              </div>
              <div className="flex items-center gap-0.5 text-[10px] text-[#71717A]">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                43
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: HeroUI Accordion */}
        <div
          className="flex-shrink-0 border-r border-[#E4E4E7] overflow-y-auto"
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
                // Match the block height so accordion header fills the collapsed row
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
              >
                {/*
                  The accordion content area adds height for the extra schedule rows.
                  We render invisible spacers so the left panel height matches the
                  right panel's ScheduleBlock height.
                */}
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

        {/* Right: Schedule grid */}
        <div className="flex-1 overflow-auto" id="right-panel">
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

      {/* ─── Legend ─── */}
      <div className="flex-shrink-0 flex items-center justify-end gap-5 px-6 py-3 border-t border-[#E4E4E7] bg-[#FAFAFA]">
        {[
          { label: 'Ca chính', color: 'bg-[#3B82F6]' },
          { label: 'Ca gãy', color: 'bg-[#F59E0B]' },
          { label: 'Ca trực', color: 'bg-[#8B5CF6]' },
          { label: 'Ca linh hoạt', color: 'bg-[#22C55E]' },
          { label: 'Nghỉ', color: 'bg-[#D4D4D8]' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs text-[#71717A]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
