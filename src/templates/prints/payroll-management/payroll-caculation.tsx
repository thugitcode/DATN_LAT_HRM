/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, type CSSProperties } from 'react';
import i18n from '@/i18n';
import { PrintFooter, PrintHeader } from '@/templates/shares/print-header-footer';
import dayjs from 'dayjs';

import { formatCurrency } from '@/lib/utils';
import type { StaffPayroll } from '@/features/payroll-management/types/payroll-caculation.type';

interface PrintPayrollCalculationProps {
  data: StaffPayroll[];
  month?: string;
  companyName: string;
  unitName: string;
  departmentName?: string;
}

const t = (key: string) => i18n.t(`payroll-management:${key}` as any);
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
const tdRight: CSSProperties = { ...tdBase, textAlign: 'right' };

export const PrintPayrollCalculation = forwardRef<HTMLDivElement, PrintPayrollCalculationProps>(
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
          title={t('payrollCalculation.title')}
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
              <th style={{ ...thStyle, width: 32 }}>{t('payrollCalculation.columns.stt')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.department')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.staff_code')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.staff_name')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.job_title')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.salary_template')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.base_salary')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.total_gross')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.total_paid_working_days')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.total_overtime_hours')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.allowance')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.bonus')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.deduction')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.net_salary')}</th>
              <th style={thStyle}>{t('payrollCalculation.columns.status')}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const bg = idx % 2 === 0 ? '#FFFFFF' : '#EFF6FF';
              const td = { ...tdCenter, backgroundColor: bg };
              const tdL = { ...tdLeft, backgroundColor: bg };
              const tdR = { ...tdRight, backgroundColor: bg };

              return (
                <tr key={idx}>
                  <td style={td}>{idx + 1}</td>
                  <td style={tdL}>
                    {[
                      ...(row.departments?.map((d: any) => d.name) ?? []),
                      ...(row.rooms?.map((r: any) => r.name) ?? []),
                    ].join(', ') || '-'}
                  </td>
                  <td style={td}>{row.staffCode ?? '-'}</td>
                  <td style={tdL}>{row.staffName ?? '-'}</td>
                  <td style={tdL}>
                    {row.position ? tc(`options.staff_position.${row.position}` as any) : '-'}
                  </td>
                  <td style={td}>{row.confirmationStatus ?? '-'}</td>
                  <td style={tdR}>{row.basicSalary?.toLocaleString('vi-VN') ?? '-'}</td>
                  <td style={tdR}>
                    {row.totalGross != null ? formatCurrency(row.totalGross) : '-'}
                  </td>
                  <td style={td}>{row.actualWorkDays ?? '-'}</td>
                  <td style={td}>{row.overtimeHours ?? '-'}</td>
                  <td style={tdR}>
                    {row.allowanceAmount != null
                      ? `+${row.allowanceAmount.toLocaleString('vi-VN')}`
                      : '-'}
                  </td>
                  <td style={tdR}>
                    {row.overtimeAmount != null
                      ? `+${row.overtimeAmount.toLocaleString('vi-VN')}`
                      : '-'}
                  </td>
                  <td style={tdR}>
                    {row.deductionAmount != null
                      ? `-${row.deductionAmount.toLocaleString('vi-VN')}`
                      : '-'}
                  </td>
                  <td style={tdR}>{row.netPay != null ? formatCurrency(row.netPay) : '-'}</td>
                  <td style={td}>{row.confirmationStatus ?? '-'}</td>
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

PrintPayrollCalculation.displayName = 'PrintPayrollCalculation';
