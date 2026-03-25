/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, type CSSProperties } from 'react';
import i18n from '@/i18n';
import { PrintFooter, PrintHeader } from '@/templates/shares/print-header-footer';
import dayjs from 'dayjs';

import { toDDMMYYYY, toHHMM } from '@/lib/utils';
import { RequestAttendanceTypeLabel } from '@/features/other-requests-management/constants/constants';
import type { GeneralRequest } from '@/features/other-requests-management/types/generate-request.type';

interface PrintBusinessTripProps {
  data: GeneralRequest[];
  month?: string;
  companyName: string;
  unitName: string;
  departmentName?: string;
}

const t = (key: string) => i18n.t(`other-requests-management:${key}` as any);
const tc = (key: string) => i18n.t(`common:${key}` as any);

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

export const PrintBusinessTrip = forwardRef<HTMLDivElement, PrintBusinessTripProps>(
  ({ data, month, companyName, unitName, departmentName }, ref) => {
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
          title={t('businessTripManagement.title')}
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
              <th style={thStyle}>{t('columns.department')}</th>
              <th style={thStyle}>{t('columns.staffCode')}</th>
              <th style={thStyle}>{t('columns.staffName')}</th>
              <th style={thStyle}>{t('columns.overtimeType')}</th>
              <th style={thStyle}>{t('columns.overtimeDate')}</th>
              <th style={thStyle}>{t('columns.trainingDate')}</th>
              <th style={thStyle}>{t('columns.startTime')}</th>
              <th style={thStyle}>{t('columns.endTime')}</th>
              <th style={thStyle}>{t('columns.totalTime')}</th>
              <th style={thStyle}>{t('columns.trainingLocation')}</th>
              <th style={thStyle}>{t('columns.reason')}</th>
              <th style={thStyle}>{t('columns.directManager')}</th>
              <th style={thStyle}>{t('columns.status')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const bg = idx % 2 === 0 ? '#FFFFFF' : '#EFF6FF';
              const td = { ...tdCenter, backgroundColor: bg };
              const tdL = { ...tdLeft, backgroundColor: bg };

              return (
                <tr key={idx}>
                  <td style={tdL}>{row.departments?.map((d) => d.name).join(', ') ?? '-'}</td>
                  <td style={td}>{row.staffCode ?? '-'}</td>
                  <td style={tdL}>{row.staffName ?? '-'}</td>
                  <td style={td}>{RequestAttendanceTypeLabel?.[row.requestType] ?? '-'}</td>
                  <td style={td}>{row.fromDate ? toDDMMYYYY(row.fromDate) : '-'}</td>
                  <td style={td}>{row.toDate ? toDDMMYYYY(row.toDate) : '-'}</td>
                  <td style={td}>{row.startTime ? toHHMM(row.startTime) : '-'}</td>
                  <td style={td}>{row.endTime ? toHHMM(row.endTime) : '-'}</td>
                  <td style={td}>{row.totalHours ?? '-'}</td>
                  <td style={tdL}>{row.location ?? '-'}</td>
                  <td style={tdL}>{row.reason ?? '-'}</td>
                  <td style={tdL}>{row.managerNames?.join(', ') ?? '-'}</td>
                  <td style={td}>{row.status ? tc(`status.${row.status.toLowerCase()}`) : '-'}</td>
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
