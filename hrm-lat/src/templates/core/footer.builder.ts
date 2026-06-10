import { tx } from './i18n';

export interface FooterRows {
  footerDateRow: unknown[];
  footerSignRow: unknown[];
}

export const buildFooterRows = (totalCols: number, year: number): FooterRows => {
  const dateOffset = Math.floor(totalCols * 0.45);
  const col1 = Math.floor(totalCols * 0.05);
  const col2 = Math.floor(totalCols * 0.38);
  const col3 = dateOffset + 2;

  const footerDateRow: unknown[] = Array(dateOffset).fill('');
  footerDateRow.push(tx('print.footer_date', { year }));

  const footerSignRow: unknown[] = Array(totalCols).fill('');
  footerSignRow[col1] = tx('print.footer_unit_head');
  footerSignRow[col2] = tx('print.footer_hr');
  footerSignRow[col3] = tx('print.footer_prepared_by');

  return { footerDateRow, footerSignRow };
};
