/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from '@/i18n';
import {
  buildExcelFooterRows,
  buildFooterMerges,
  buildHeaderMerges,
  buildHeaderRows,
  type ExcelFooterConfig,
  type ExcelHeaderConfig,
} from '@/templates/shares/excel-header-footer';
import * as XLSX from 'xlsx-js-style';

export const DAY_SHORT: Record<number, string> = {
  0: 'CN',
  1: 'T2',
  2: 'T3',
  3: 'T4',
  4: 'T5',
  5: 'T6',
  6: 'T7',
};

export const tx = (key: string, options?: object) =>
  i18n.t(`timekeeping-shift-scheduling:${key}` as any, options as any);

export const getStaffPositionMap = (): Record<string, string> => ({
  STAFF: tx('staff_position.staff'),
  HEAD_OF_DEPARTMENT: tx('staff_position.head_of_department'),
  DEPUTY_HEAD_OF_DEPARTMENT: tx('staff_position.deputy_head_of_department'),
  CHIEF_NURSE: tx('staff_position.chief_nurse'),
  MANAGER: tx('staff_position.manager'),
  HEAD_OF_UNIT: tx('staff_position.head_of_unit'),
  DEPUTY_MANAGER: tx('staff_position.deputy_manager'),
});

export const buildSharedHeader = (
  totalCols: number,
  leftInfoCols: number,
  month: number,
  year: number,
  departmentName: string,
): { rows: unknown[][]; merges: XLSX.Range[] } => {
  const headerCfg: ExcelHeaderConfig = {
    companyName: tx('print.company_name_1'),
    unitName: tx('print.company_name_2'),
    title: tx('print.title', { month: month + 1, year }),
    departmentName: departmentName
      ? `${tx('print.department_label')}: ${departmentName}`
      : tx('print.department_label'),
    totalCols,
    leftInfoCols,
  };
  const { row1, row2 } = buildHeaderRows(headerCfg);
  const merges = buildHeaderMerges({ totalCols, leftInfoCols }, 0);
  return { rows: [row1, row2], merges };
};

export const buildSharedFooter = (
  totalCols: number,
  lastDataRow: number,
): { rows: unknown[][]; merges: XLSX.Range[] } => {
  const footerCfg: ExcelFooterConfig = { totalCols };
  const { blankRow, dateRow, blankSignRow, signRow } = buildExcelFooterRows(footerCfg);
  const footerOffset = lastDataRow + 1 + 4;
  const merges = buildFooterMerges({ totalCols }, footerOffset);
  return {
    rows: [
      Array(totalCols).fill(''),
      Array(totalCols).fill(''),
      Array(totalCols).fill(''),
      Array(totalCols).fill(''),
      blankRow,
      dateRow,
      blankSignRow,
      signRow,
    ],
    merges,
  };
};
