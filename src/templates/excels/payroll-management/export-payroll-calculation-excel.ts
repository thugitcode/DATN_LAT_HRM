import i18n from '@/i18n';
import { dataStyle, headerStyle, stripedBg } from '@/templates/core/styles';
import {
  applyStyleToRange,
  buildSheet,
  writeWorkbook,
  type SheetConfig,
} from '@/templates/core/xlsx-builder';
import {
  applyFooterStyles,
  applyHeaderStyles,
  buildExcelFooterRows,
  buildFooterMerges,
  buildHeaderMerges,
  buildHeaderRows,
  type ExcelFooterConfig,
  type ExcelHeaderConfig,
} from '@/templates/shares/excel-header-footer';
import dayjs from 'dayjs';

import { formatCurrency } from '@/lib/utils';
import type { StaffPayroll } from '@/features/payroll-management/types/payroll-caculation.type';

const SHEET_NAME = 'Tính lương';
const HEADER_BG = 'DBEAFE';
const LEFT_INFO_COLS = 3;

const ROW_BLANK = 2;
const ROW_HEADER = 3;
const ROW_DATA = 4;

const COL_WIDTHS = [8, 22, 16, 22, 20, 22, 18, 18, 16, 16, 18, 18, 18, 18, 20];
const TOTAL_COLS = COL_WIDTHS.length;

const resolveMonth = (month?: string) => {
  const parsed = month ? dayjs(month) : dayjs();
  return parsed.isValid() ? parsed : dayjs();
};

const buildColHeaderRow = (t: (key: string) => string): string[] => [
  t('payrollCalculation.columns.stt'),
  t('payrollCalculation.columns.department'),
  t('payrollCalculation.columns.staff_code'),
  t('payrollCalculation.columns.staff_name'),
  t('payrollCalculation.columns.job_title'),
  t('payrollCalculation.columns.salary_template'),
  t('payrollCalculation.columns.base_salary'),
  t('payrollCalculation.columns.total_gross'),
  t('payrollCalculation.columns.total_paid_working_days'),
  t('payrollCalculation.columns.total_overtime_hours'),
  t('payrollCalculation.columns.allowance'),
  t('payrollCalculation.columns.bonus'),
  t('payrollCalculation.columns.deduction'),
  t('payrollCalculation.columns.net_salary'),
  t('payrollCalculation.columns.status'),
];

const buildDataRow = (row: StaffPayroll, idx: number): unknown[] => [
  idx + 1,
  [...(row.departments?.map((d) => d.name) ?? []), ...(row.rooms?.map((r) => r.name) ?? [])].join(
    '\n',
  ) || '-',
  row.staffCode ?? '-',
  row.staffName ?? '-',
  row.position ? i18n.t(`common:options.staff_position.${row.position}`) : '-',
  row.confirmationStatus ?? '-',
  row.basicSalary ?? '-',
  row.totalGross ?? '-',
  row.actualWorkDays ?? '-',
  row.overtimeHours ?? '-',
  row.allowanceAmount ?? '-',
  row.overtimeAmount ?? '-',
  row.deductionAmount ?? '-',
  row.netPay ?? '-',
  row.confirmationStatus ?? '-',
];

const buildAoa = (
  data: StaffPayroll[],
  base: dayjs.Dayjs,
  companyName: string,
  unitName: string,
  departmentName: string,
  t: (key: string, options?: object) => string,
): unknown[][] => {
  const headerCfg: ExcelHeaderConfig = {
    companyName,
    unitName,
    title: t('payrollCalculation.title'),
    departmentName: departmentName ? `Khoa ${departmentName}` : undefined,
    totalCols: TOTAL_COLS,
    leftInfoCols: LEFT_INFO_COLS,
  };

  const footerCfg: ExcelFooterConfig = {
    totalCols: TOTAL_COLS,
  };

  const { row1, row2 } = buildHeaderRows(headerCfg);
  const { blankRow, dateRow, blankSignRow, signRow } = buildExcelFooterRows(footerCfg);

  return [
    row1,
    row2,
    Array(TOTAL_COLS).fill(''),
    buildColHeaderRow(t),
    ...data.map((row, idx) => buildDataRow(row, idx)),
    Array(TOTAL_COLS).fill(''),
    Array(TOTAL_COLS).fill(''),
    Array(TOTAL_COLS).fill(''),
    Array(TOTAL_COLS).fill(''),
    blankRow,
    dateRow,
    blankSignRow,
    signRow,
  ];
};

const buildMerges = (dataLength: number) => {
  const footerOffset = ROW_DATA + dataLength + 4;
  return [
    ...buildHeaderMerges({ totalCols: TOTAL_COLS, leftInfoCols: LEFT_INFO_COLS }, 0),
    ...buildFooterMerges({ totalCols: TOTAL_COLS }, footerOffset),
  ];
};

const buildApplyStyles =
  (dataLength: number) => (ws: Parameters<SheetConfig['applyStyles']>[0]) => {
    const lastDataRow = ROW_DATA + dataLength - 1;
    const footerOffset = ROW_DATA + dataLength + 4;

    applyHeaderStyles(ws, { leftInfoCols: LEFT_INFO_COLS }, 0);

    applyStyleToRange(ws, (r, c) => {
      if (r === ROW_BLANK) return null;
      if (r === ROW_HEADER) return headerStyle(HEADER_BG);
      if (r >= ROW_DATA && r <= lastDataRow) {
        // left-align: department, staff name, job title, salary template
        const isLeftAlign = c === 1 || c === 3 || c === 4 || c === 5;
        // right-align: currency columns
        const isRightAlign = c === 6 || c === 7 || c === 10 || c === 11 || c === 12 || c === 13;
        return dataStyle({
          isLeft: isLeftAlign,
          isRight: isRightAlign,
          bgRgb: stripedBg(r - ROW_DATA),
        });
      }
      return null;
    });

    applyFooterStyles(ws, footerOffset, TOTAL_COLS);
  };

interface ExportPayrollCalculationParams {
  data: StaffPayroll[];
  month?: string;
  companyName: string;
  unitName: string;
  departmentName?: string;
  t: (key: string, options?: object) => string;
}

export const exportPayrollCalculationExcel = ({
  data,
  month,
  companyName,
  unitName,
  departmentName = '',
  t,
}: ExportPayrollCalculationParams) => {
  const base = resolveMonth(month);
  const dataLength = data.length;

  const config: SheetConfig = {
    aoa: buildAoa(data, base, companyName, unitName, departmentName, t),
    merges: buildMerges(dataLength),
    colWidths: COL_WIDTHS,
    rowHeights: [22, 18, 8, 36, ...Array(dataLength).fill(20), 12, 12, 12, 12, 8, 20, 8, 20],
    sheetName: SHEET_NAME,
    applyStyles: buildApplyStyles(dataLength),
  };

  const ws = buildSheet(config);
  writeWorkbook(ws, SHEET_NAME, `${SHEET_NAME} ${base.format('MM-YYYY')}.xlsx`);
};
