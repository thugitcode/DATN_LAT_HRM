/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, type CSSProperties, type JSX } from 'react';
import i18n from '@/i18n';
import { PrintFooter, PrintHeader } from '@/templates/shares/print-header-footer';

interface SalarySlipData {
  staffName: string;
  staffCode: string;
  departmentName: string;
  monthLabel: string;
  fromDate: string;
  toDate: string;
  standardWorkingDays: number;
  actualWorkDays: number;
  paidLeave: number;
  unpaidLeave: number;
  totalWorkDays: number;
  totalLeaveDays: number;
  usedLeaveDays: number;
  remainingLeaveDays: number;
  totalOvertimeHours: number;
  overtimeAmount: number;
  compHoursUsed: number;
  compHoursRemaining: number;
  contractBasicSalary: number;
  contractHazardAllowance: number;
  contractSupportAllowance: number;
  contractTotalSalary: number;
  actualWorkSalary: number;
  onCallDays: number;
  onCallSalary: number;
  actualPositionAllowance: number;
  actualBasicSalaryByWork: number;
  responsibilityAllowance: number;
  positionAllowance: number;
  hazardAllowance: number;
  mealAllowance: number;
  fuelAllowance: number;
  phoneAllowance: number;
  businessTripAllowance: number;
  otherAllowance: number;
  performanceSalary: number;
  bonusAmount: number;
  otherIncomeAndOvertime: number;
  totalBeforeDeduction: number;
  violationPenalty: number;
  violationDetails: string;
  insuranceBaseSalary: number;
  socialInsurance: number;
  healthInsurance: number;
  unemploymentInsurance: number;
  unionFee: number;
  selfDeduction: number;
  familyDeduction: number;
  taxExemptIncome: number;
  personalIncomeTax: number;
  totalDeduction: number;
  netIncome: number;
  prepaidPhase1: number;
  advancePayment: number;
  pensionFund1Percent: number;
  finalAmount: number;
}

interface PrintSalarySlipProps {
  data?: SalarySlipData;
  companyName: string;
  unitName: string;
}

const t = (key: string) => i18n.t(`payroll-management:${key}` as any);
const tc = (key: string) => i18n.t(`common:${key}` as any);

const fmt = (val?: number) => (val != null && val !== 0 ? val.toLocaleString('vi-VN') : '-');

const border = '1px solid #D1D5DB';

const base: CSSProperties = {
  border,
  padding: '3px 6px',
  fontSize: '10px',
  verticalAlign: 'middle',
  lineHeight: '1.5',
};

const tdLabel: CSSProperties = { ...base, textAlign: 'left' };
const tdCenter: CSSProperties = { ...base, textAlign: 'center' };
const tdRight: CSSProperties = { ...base, textAlign: 'right' };

const sectionHeader = (label: string, colSpan: number, idx: string): JSX.Element => (
  <tr style={{ backgroundColor: '#DBEAFE' }}>
    <td style={{ ...tdCenter, fontWeight: 'bold', color: '#1E3A5F', width: 28 }}>{idx}</td>
    <td colSpan={colSpan} style={{ ...tdLabel, fontWeight: 'bold', color: '#1E3A5F' }}>
      {label}
    </td>
  </tr>
);

const dataRow = (
  no: string,
  label: string,
  tt: string,
  note: string,
  amount?: number,
  bg = '#FFFFFF',
): JSX.Element => (
  <tr style={{ backgroundColor: bg }}>
    <td style={{ ...tdCenter, color: '#6B7280' }}>{no}</td>
    <td style={tdLabel}>{label}</td>
    <td style={tdCenter}>{tt}</td>
    <td style={{ ...tdLabel, color: '#6B7280', fontStyle: 'italic' }}>{note}</td>
    <td style={tdRight}>{amount != null ? fmt(amount) : '-'}</td>
  </tr>
);

export const PrintSalarySlip = forwardRef<HTMLDivElement, PrintSalarySlipProps>(
  ({ data, companyName, unitName }, ref) => {
    if (!data) return null;

    const strip = (i: number) => (i % 2 === 0 ? '#FFFFFF' : '#F9FAFB');

    return (
      <div
        ref={ref}
        style={{
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: '10px',
          color: '#111',
          padding: '16px',
          maxWidth: '780px',
          margin: '0 auto',
        }}
      >
        <style>{`
          @media print {
            body, html { margin: 0; padding: 0; }
            @page { size: A4 portrait; margin: 10mm 8mm; }
            thead { display: table-header-group; }
          }
        `}</style>

        {/* ── Header ── */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '8px' }}>
          <tbody>
            <tr>
              {/* Logo + company */}
              <td style={{ width: '50%', verticalAlign: 'middle' }}>
                <PrintHeader companyName={companyName} unitName={unitName} title="" />
              </td>

              {/* Right: title + staff info */}
              <td style={{ width: '50%', verticalAlign: 'top', textAlign: 'right' }}>
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '13px',
                    color: '#1E3A5F',
                    textTransform: 'uppercase',
                    marginBottom: '2px',
                  }}
                >
                  {data.monthLabel}
                </div>
                <div style={{ color: '#DC2626', fontWeight: 'bold', fontSize: '11px' }}>
                  {data.staffCode} – {data.staffName}
                </div>
                <div style={{ color: '#DC2626', fontStyle: 'italic', fontSize: '11px' }}>
                  {data.staffCode} – {data.departmentName}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* ── Main table ── */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            tableLayout: 'fixed',
            marginTop: '4px',
          }}
        >
          <colgroup>
            <col style={{ width: '5%' }} /> {/* STT/Index */}
            <col style={{ width: '45%' }} /> {/* Khoản mục */}
            <col style={{ width: '6%' }} /> {/* TT */}
            <col style={{ width: '28%' }} /> {/* Ghi chú */}
            <col style={{ width: '16%' }} /> {/* Tiền lương */}
          </colgroup>

          <thead>
            <tr style={{ backgroundColor: '#DBEAFE' }}>
              <th style={{ ...tdCenter, fontWeight: 'bold', color: '#1E3A5F' }} />
              <th style={{ ...tdLabel, fontWeight: 'bold', color: '#1E3A5F' }}>Khoản Mục</th>
              <th style={{ ...tdCenter, fontWeight: 'bold', color: '#1E3A5F' }}>TT</th>
              <th style={{ ...tdCenter, fontWeight: 'bold', color: '#1E3A5F' }}>Ghi Chú</th>
              <th style={{ ...tdCenter, fontWeight: 'bold', color: '#1E3A5F' }}>Tiền Lương</th>
            </tr>
          </thead>

          <tbody>
            {/* A – LƯƠNG CƠ BẢN */}
            {sectionHeader('A LƯƠNG CƠ BẢN', 3, 'A')}
            {dataRow(
              '1',
              'Lương căn bản',
              '1',
              'Theo hợp đồng',
              data.contractBasicSalary,
              strip(0),
            )}
            {dataRow(
              '2',
              'Phụ cấp độc hại',
              '2',
              'Theo hợp đồng',
              data.contractHazardAllowance,
              strip(1),
            )}
            {dataRow('3', 'Hỗ trợ', '3', 'Theo hợp đồng', data.contractSupportAllowance, strip(2))}
            {dataRow(
              '4',
              'Lương CB theo hợp đồng',
              '4',
              '=(1)+(2)+(3)',
              data.contractTotalSalary,
              strip(3),
            )}
            {dataRow(
              '5',
              'Lương CB tính theo ngày công thực tế trong tháng',
              '5',
              '=(6)+(7)+(8)',
              data.actualBasicSalaryByWork,
              strip(4),
            )}

            <tr style={{ backgroundColor: strip(5) }}>
              <td style={{ ...tdCenter, color: '#6B7280' }}>-</td>
              <td style={tdLabel}>Ngày công &amp; Lương theo ngày công</td>
              <td style={tdCenter}>6</td>
              <td style={{ ...tdLabel, fontWeight: 'bold' }}>Ngày công</td>
              <td style={tdRight}>{fmt(data.actualWorkSalary)}</td>
            </tr>
            <tr style={{ backgroundColor: strip(6) }}>
              <td style={{ ...tdCenter, color: '#6B7280' }}>-</td>
              <td style={tdLabel}>Ngày trực &amp; Phụ cấp trực</td>
              <td style={tdCenter}>7</td>
              <td style={{ ...tdLabel, fontWeight: 'bold' }}>{data.onCallDays}Ngày trực</td>
              <td style={tdRight}>{fmt(data.onCallSalary)}</td>
            </tr>
            {dataRow('-', 'Phụ cấp chức vụ', '8', '', data.actualPositionAllowance, strip(7))}

            {/* B */}
            {sectionHeader('B THU NHẬP KHÁC & HỖ TRỢ ƯU ĐÃI NGHỀ', 3, 'B')}
            {dataRow('-', 'Phụ cấp trách nhiệm', '9a', '', data.responsibilityAllowance, strip(0))}
            {dataRow('-', 'Phụ cấp chức danh', '9b', '', data.positionAllowance, strip(1))}
            {dataRow('-', 'Phụ cấp độc hại (thực tế)', '9c', '', data.hazardAllowance, strip(2))}
            {dataRow('-', 'Phụ cấp ăn', '9d', '', data.mealAllowance, strip(3))}
            {dataRow('-', 'Phụ cấp xăng xe', '9e', '', data.fuelAllowance, strip(4))}
            {dataRow('-', 'Phụ cấp điện thoại', '9f', '', data.phoneAllowance, strip(5))}
            {dataRow('-', 'Phụ cấp công tác', '9g', '', data.businessTripAllowance, strip(6))}
            {dataRow(
              '-',
              'Thu nhập khác & tăng ca',
              '9',
              '',
              data.otherIncomeAndOvertime,
              strip(7),
            )}
            {dataRow('-', 'Lương hiệu suất', '-', '', data.performanceSalary, strip(8))}
            {dataRow('-', 'Thưởng', '-', '', data.bonusAmount, strip(9))}

            {/* C */}
            {sectionHeader('C LƯƠNG CHƯA TRỪ CÁC KHOẢN NỘP', 3, 'C')}
            {dataRow('', '', '10', '=(5)-(9)', data.totalBeforeDeduction, strip(0))}

            {/* D */}
            {sectionHeader('D CÁC KHOẢN PHẢI NỘP THEO LƯƠNG', 3, 'D')}
            {dataRow('', '', '11', '=(12)+(13)+(14)+(15)', data.totalDeduction, strip(0))}
            {dataRow('1', 'BHXH (8%)', '12', '=(1+2)*8%', data.socialInsurance, strip(1))}
            {dataRow('2', 'BHYT (1,5%)', '13', '=(1+2)*1.5%', data.healthInsurance, strip(2))}
            {dataRow('3', 'BHTN (1%)', '14', '=(1+2)*1%', data.unemploymentInsurance, strip(3))}
            {dataRow('4', 'Thuế TNCN', '15', '', data.personalIncomeTax, strip(4))}

            {/* E */}
            {sectionHeader('E THU NHẬP THỰC LĨNH', 3, 'E')}
            {dataRow('', '', '16', '=(10)-(11)', data.netIncome, strip(0))}
            {dataRow('-', 'Đã lĩnh đợt 1', '17', '', data.prepaidPhase1, strip(1))}
            {dataRow('-', 'Tạm ứng lương trong tháng', '18', '', data.advancePayment, strip(2))}
            {dataRow('-', 'Trích 1% quỹ BHNN', '19', '', data.pensionFund1Percent, strip(3))}

            {/* F */}
            {sectionHeader('F CÒN LĨNH', 3, 'F')}
            {dataRow('', '', '20', '=(16)-(17)-(18)-(19)', data.finalAmount, strip(0))}
          </tbody>
        </table>

        {/* ── Note ── */}
        <div
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '10px',
            color: '#374151',
            lineHeight: '1.8',
          }}
        >
          <div>
            Ban Lãnh đạo Công ty và Ban Giám đốc Bệnh viện Chân thành cảm ơn sự đóng góp của Quý
            Anh/Chị
          </div>
          <div>
            Rất mong nhận được sự đóng góp nhiều hơn nữa từ Quý Anh/Chị vào sự phát triển của Bệnh
            Viện.
          </div>
        </div>
      </div>
    );
  },
);

PrintSalarySlip.displayName = 'PrintSalarySlip';
