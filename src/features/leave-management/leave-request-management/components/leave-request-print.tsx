import { forwardRef, useMemo, type CSSProperties } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { formatDate } from '@/lib/utils';
import { getStaffPosition } from '@/features/timekeeping-shift-scheduling/shift-management/constants/data';

import type { LeaveRequest } from '../type';

// ─── Colors (đồng bộ ShiftManagementPrint) ───────────────────────────────────

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

// ─── Column definitions ───────────────────────────────────────────────────────

interface PrintCol {
  key: string;
  label: string;
  width: string;
  align?: 'left';
  render: (row: LeaveRequest, staffPositionMap: Record<string, string>) => unknown;
}

const PRINT_COLS: PrintCol[] = [
  {
    key: 'departments',
    label: 'Khoa/Phòng',
    width: '70px',
    align: 'left',
    render: (row) => row.departments?.map((d) => d.name).join(', ') ?? '',
  },
  {
    key: 'staffCode',
    label: 'Mã NV',
    width: '44px',
    render: (row) => row.staffCode ?? '',
  },
  {
    key: 'staffName',
    label: 'Họ và tên',
    width: '70px',
    align: 'left',
    render: (row) => row.staffName ?? '',
  },
  {
    key: 'staffPosition',
    label: 'Chức vụ',
    width: '44px',
    render: (row, pos) => pos[row.staffPosition] ?? '',
  },
  {
    key: 'leaveReasonName',
    label: 'Loại nghỉ',
    width: '52px',
    render: (row) => row.leaveReasonName ?? '',
  },
  {
    key: 'fromDate',
    label: 'Từ ngày',
    width: '52px',
    render: (row) => {
      const time = row.startTime ? `${row.startTime.slice(0, 5)} ` : '';
      return `${time}${formatDate(row.fromDate)}`;
    },
  },
  {
    key: 'toDate',
    label: 'Đến ngày',
    width: '52px',
    render: (row) => {
      const time = row.endTime ? `${row.endTime.slice(0, 5)} ` : '';
      return `${time}${formatDate(row.toDate)}`;
    },
  },
  {
    key: 'totalDays',
    label: 'Số ngày',
    width: '36px',
    render: (row) => {
      const days = Number(row.totalDays);
      return days % 1 === 0 ? Math.floor(days) : days;
    },
  },
  {
    key: 'reason',
    label: 'Lý do',
    width: '80px',
    align: 'left',
    render: (row) => row.reason ?? '',
  },
  {
    key: 'replacementStaffName',
    label: 'Người thay thế',
    width: '65px',
    align: 'left',
    render: (row) => row.replacementStaffName ?? '',
  },
  {
    key: 'approvedByName',
    label: 'Người duyệt',
    width: '65px',
    align: 'left',
    render: (row) => row.approvedByName ?? '—',
  },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface LeaveRequestPrintProps {
  data: LeaveRequest[];
  departmentName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const LeaveRequestPrint = forwardRef<HTMLDivElement, LeaveRequestPrintProps>(
  ({ data, departmentName = '' }, ref) => {
    const { t } = useTranslation(NAMESPACES.LEAVE_MANAGEMENT);
    const { t: tts } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
    const staffPositionMap = useMemo(() => getStaffPosition(tts) as Record<string, string>, [tts]);

    const year = dayjs().year();

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

    const tdBase: CSSProperties = {
      border: borderStyle,
      textAlign: 'center',
      verticalAlign: 'middle',
      padding: '2px',
      wordBreak: 'break-word',
      lineHeight: '1.3',
      fontSize: '9px',
    };
    const tdLeft: CSSProperties = { textAlign: 'left', paddingLeft: '3px' };

    return (
      <div ref={ref}>
        <style>{`
          @media print {
            body, html { margin: 0; padding: 0; }
            body * { visibility: hidden; }
            .leave-print-wrap, .leave-print-wrap * { visibility: visible; }
            .leave-print-wrap {
              position: absolute;
              top: 0; left: 0;
              width: 100%;
              padding: 6mm 8mm;
              box-sizing: border-box;
              background: white;
            }
            @page { size: A4 landscape; margin: 10mm 8mm; }
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; break-inside: avoid; }
          }
        `}</style>

        <div
          className="leave-print-wrap"
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: '9px',
            color: '#111',
            padding: '16px',
          }}
        >
          {/* ── Header (đồng bộ ShiftManagementPrint) ── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            {/* Góc trái */}
            <div style={{ lineHeight: '1.6' }}>
              <div style={{ fontWeight: 'bold', fontSize: '10px' }}>
                {tts('print.company_name_1')}
              </div>
              <div style={{ fontWeight: 'bold', fontSize: '10px' }}>
                {tts('print.company_name_2')}
              </div>
            </div>

            {/* Tiêu đề giữa */}
            <div style={{ textAlign: 'center', flex: 1, paddingLeft: '16px' }}>
              <div
                style={{
                  fontWeight: 'bold',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {t('leave_request.title')}
              </div>
              {departmentName && (
                <div style={{ fontSize: '10px', marginTop: '2px' }}>
                  {tts('print.department_label')}: <strong>{departmentName}</strong>
                </div>
              )}
            </div>

            {/* Placeholder cân bằng bên phải */}
            <div style={{ minWidth: '120px' }} />
          </div>

          {/* ── Table ── */}
          <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: '22px' }} />
              {PRINT_COLS.map((c) => (
                <col key={c.key} style={{ width: c.width }} />
              ))}
            </colgroup>

            <thead>
              {/* Top banner row */}
              <tr>
                <th colSpan={PRINT_COLS.length + 1} style={thWeek}>
                  {t('leave_request.title')}
                  {departmentName ? ` — ${tts('print.department_label')}: ${departmentName}` : ''}
                </th>
              </tr>

              {/* Column label row */}
              <tr>
                <th style={thDayNum}>{tts('columns.stt')}</th>
                {PRINT_COLS.map((c) => (
                  <th key={c.key} style={thDayNum}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {data.map((row, idx) => {
                const isEven = idx % 2 === 0;
                const td: CSSProperties = {
                  ...tdBase,
                  backgroundColor: isEven ? COLOR.rowEven : COLOR.rowOdd,
                };
                return (
                  <tr key={row.id}>
                    <td style={td}>{idx + 1}</td>
                    {PRINT_COLS.map((col) => (
                      <td key={col.key} style={col.align === 'left' ? { ...td, ...tdLeft } : td}>
                        {col.render(row, staffPositionMap) as string}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* ── Footer (đồng bộ ShiftManagementPrint) ── */}
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

LeaveRequestPrint.displayName = 'LeaveRequestPrint';
