import { useRef } from 'react';
import * as XLSX from 'xlsx';

export interface ExcelColumnDef<T> {
  header: string;
  key: keyof T;
  width?: number;
  required?: boolean;
  example?: string;
  exportFormatter?: (value: unknown) => string | number;
  importParser?: (value: string) => string | number;
}

export interface ExcelExportConfig<T = Record<string, unknown>> {
  fileName: string;
  sheetName?: string;
  columns: ExcelColumnDef<T>[];
  data: T[];
  includeExampleRow?: boolean;
  defaultRowHeight?: number;
  headerRowHeight?: number;
  merges?: { s: { r: number; c: number }; e: { r: number; c: number } }[];
}

export interface ImportError {
  row: number;
  column: string;
  message: string;
}

export interface ExcelImportConfig<T = Record<string, unknown>> {
  columns: ExcelColumnDef<T>[];
  onImport: (rows: T[]) => Promise<void> | void;
  onError?: (errors: ImportError[]) => void;
}

export const useExcelIO = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportToExcel = <T>(config: ExcelExportConfig<T>) => {
    const { fileName, sheetName = 'Sheet1', columns, data, includeExampleRow } = config;

    const headers = columns.map((col) => col.header);

    const rows = data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];
        return col.exportFormatter ? col.exportFormatter(value) : (value ?? '');
      }),
    );

    const sheetData: unknown[][] = [headers];

    if (includeExampleRow) {
      sheetData.push(columns.map((col) => col.example ?? ''));
    }

    sheetData.push(...rows);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    if (config.merges?.length) {
      ws['!merges'] = config.merges;
    }

    ws['!cols'] = columns.map((col) => ({ wch: col.width ?? 16 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  };

  const exportTemplate = <T>(config: Omit<ExcelExportConfig<T>, 'data'>) => {
    exportToExcel({ ...config, data: [], includeExampleRow: true });
  };

  const triggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async <T>(
    e: React.ChangeEvent<HTMLInputElement>,
    config: ExcelImportConfig<T>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { header: 1 });

    if (rawRows.length < 2) return;

    const headerRow = rawRows[0] as string[];
    const dataRows = rawRows.slice(1);

    const errors: ImportError[] = [];
    const parsed: T[] = [];

    dataRows.forEach((row, rowIndex) => {
      const record: Record<string, unknown> = {};

      config.columns.forEach((col) => {
        const colIndex = headerRow.indexOf(col.header);
        const rawValue = colIndex >= 0 ? String(row[colIndex] ?? '') : '';

        if (col.required && !rawValue) {
          errors.push({
            row: rowIndex + 2,
            column: col.header,
            message: `Trường "${col.header}" là bắt buộc`,
          });
          return;
        }

        record[col.key as string] = col.importParser ? col.importParser(rawValue) : rawValue;
      });

      parsed.push(record as T);
    });

    if (errors.length > 0) {
      config.onError?.(errors);
      return;
    }

    await config.onImport(parsed);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return {
    fileInputRef,
    exportToExcel,
    exportTemplate,
    triggerImport,
    handleFileChange,
  };
};
