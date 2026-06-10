/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, type CSSProperties } from 'react';
import i18n from '@/i18n';
import { PrintFooter, PrintHeader } from '@/templates/shares/print-header-footer';
import dayjs from 'dayjs';

import { formatDate } from '@/lib/utils';
import type { LeaveRequest } from '@/features/leave-management/leave-request-management/type';

interface LeaveRequestPrintProps {
  data: LeaveRequest[];
  month?: string;
  companyName?: string;
  unitName?: string;
  departmentName?: string;
}

const t = (key: string, options?: object) =>
  i18n.t(`leave-management:${key}` as any, options as any);
const tts = (key: string) => i18n.t(`timekeeping-shift-scheduling:${key}` as any);

const resolveMonth = (month?: string) => {
  const parsed = month ? dayjs(month) : dayjs();
  return parsed.isValid() ? parsed : dayjs();
};

const borderStyle = '1px solid #D1D5DB';

const thStyle: CSSProperties = {
  border: borderStyle,
  textAlign: 'center',
  verticalAlign: 'middle',
  padding: '2px',
  fontSize: '9px',
  fontWeight: 'bold',
  color: '#1E3A5F',
  backgroundColor: '#DBEAFE',
};

const tdBase: CSSProperties = {
  border: borderStyle,
  verticalAlign: 'middle',
  padding: '2px',
  fontSize: '9px',
  wordBreak: 'break-word',
  lineHeight: '1.3',
};

const tdCenter: CSSProperties = { ...tdBase, textAlign: 'center' };
const tdLeft: CSSProperties = { ...tdBase, textAlign: 'left' };

export const LeaveRequestPrint = forwardRef<HTMLDivElement, LeaveRequestPrintProps>(
  (
    { data, month, companyName = 'Bệnh viện đa khoa', unitName = 'TRUNG TÂM Y TẾ', departmentName },
    ref,
  ) => {
    const base = resolveMonth(month);
    const monthLabel = base.format('MM/YYYY');

    return (
      <div
        ref={ref}
        style={{
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: '9px',
          color: '#111',
          padding: '16px',
        }}
      >
        <style>{`
          @media print {
            body, html { margin: 0; padding: 0; }
            @page { size: A4 landscape; margin: 10mm 8mm; }
            thead { display: table-header-group; }
          }
        `}</style>

        <PrintHeader
          companyName={companyName}
          unitName={unitName}
          title={t('leave_request.title')}
          subtitle={departmentName}
        />

        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            marginTop: '8px',
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>{t('leave_request.columns.department')}</th>
              <th style={thStyle}>{t('leave_request.columns.staff_code')}</th>
              <th style={thStyle}>{t('leave_request.columns.staff_name')}</th>
              <th style={thStyle}>{t('leave_request.columns.position')}</th>
              <th style={thStyle}>{t('leave_request.columns.leave_type')}</th>
              <th style={thStyle}>{t('leave_request.columns.from_date')}</th>
              <th style={thStyle}>{t('leave_request.columns.to_date')}</th>
              <th style={thStyle}>{t('leave_request.columns.total_days')}</th>
              <th style={thStyle}>{t('leave_request.columns.reason')}</th>
              <th style={thStyle}>{t('leave_request.columns.replacement')}</th>
              <th style={thStyle}>{t('leave_request.columns.approved_by')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const bg = idx % 2 === 0 ? '#FFFFFF' : '#F0F1FF';
              const td = { ...tdCenter, backgroundColor: bg };
              const tdL = { ...tdLeft, backgroundColor: bg };

              const days = Number(row.totalDays);
              const display = days % 1 === 0 ? Math.floor(days) : days;

              const fromDate = [
                row.startTime ? row.startTime.slice(0, 5) : '',
                row.fromDate ? formatDate(row.fromDate) : '-',
              ]
                .filter(Boolean)
                .join(' ');

              const toDate = [
                row.endTime ? row.endTime.slice(0, 5) : '',
                row.toDate ? formatDate(row.toDate) : '-',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <tr key={idx}>
                  <td style={tdL}>{row.departments?.map((d) => d.name).join(', ') ?? '-'}</td>
                  <td style={td}>{row.staffCode ?? '-'}</td>
                  <td style={tdL}>{row.staffName ?? '-'}</td>
                  <td style={td}>
                    {tts(`staff_position.${row.staffPosition?.toLowerCase()}`) ?? '-'}
                  </td>
                  <td style={td}>{row.leaveReasonName ?? '-'}</td>
                  <td style={td}>{fromDate}</td>
                  <td style={td}>{toDate}</td>
                  <td style={td}>{t('leave_request.columns.days_count', { count: display })}</td>
                  <td style={tdL}>{row.reason ?? '-'}</td>
                  <td style={tdL}>{row.replacementStaffName ?? '-'}</td>
                  <td style={tdL}>{row.approvedByName ?? '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <PrintFooter />
      </div>
    );
  },
);

LeaveRequestPrint.displayName = 'LeaveRequestPrint';
