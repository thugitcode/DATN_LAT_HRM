import { useCallback, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ExcelColumnDef<T> {
  header: string;
  key: keyof T;
  width?: number;
  required?: boolean;
  example?: string;
  exportFormatter?: (value: unknown) => string | number;
  importParser?: (value: string) => unknown;
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
  /** Nếu true: có lỗi 1 row vẫn import các row hợp lệ, lỗi trả về onError */
  continueOnError?: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useExcelIO = () => {
  const [isImporting, setIsImporting] = useState(false);

  // Mỗi lần gọi useExcelIO tạo ref riêng → không conflict khi dùng nhiều chỗ
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Export ────────────────────────────────────────────────────────────────

  const exportToExcel = useCallback(<T>(config: ExcelExportConfig<T>) => {
    const { fileName, sheetName = 'Sheet1', columns, data, includeExampleRow } = config;

    const headers = columns.map((col) => col.header);

    const sheetData: unknown[][] = [headers];

    if (includeExampleRow) {
      sheetData.push(columns.map((col) => col.example ?? ''));
    }

    const rows = data.map((row) =>
      columns.map((col) => {
        const value = row[col.key];
        return col.exportFormatter ? col.exportFormatter(value) : (value ?? '');
      }),
    );

    sheetData.push(...rows);

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    if (config.merges?.length) {
      ws['!merges'] = config.merges;
    }

    ws['!cols'] = columns.map((col) => ({ wch: col.width ?? 16 }));

    if (config.headerRowHeight || config.defaultRowHeight) {
      ws['!rows'] = sheetData.map((_, i) => ({
        hpt: i === 0 ? (config.headerRowHeight ?? 20) : (config.defaultRowHeight ?? 16),
      }));
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }, []);

  const exportTemplate = useCallback(
    <T>(config: Omit<ExcelExportConfig<T>, 'data'>) => {
      exportToExcel({ ...config, data: [], includeExampleRow: true });
    },
    [exportToExcel],
  );

  // ─── Import ────────────────────────────────────────────────────────────────

  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const parseFile = useCallback(
    async <T>(file: File, config: ExcelImportConfig<T>): Promise<void> => {
      const { columns, onImport, onError, continueOnError = false } = config;

      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer);
      const ws = wb.Sheets[wb.SheetNames[0]];

      // header: 1 → trả về array of arrays
      const rawRows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });

      // Bỏ qua file rỗng hoặc chỉ có header
      if (rawRows.length < 2) return;

      const headerRow = rawRows[0];
      // Lọc bỏ các trailing rows rỗng
      const dataRows = rawRows.slice(1).filter((row) => row.some((cell) => cell !== ''));

      const errors: ImportError[] = [];
      const parsed: T[] = [];

      dataRows.forEach((row, rowIndex) => {
        const record: Record<string, unknown> = {};
        let rowHasError = false;

        columns.forEach((col) => {
          const colIndex = headerRow.indexOf(col.header);

          // Header không tìm thấy trong file
          if (colIndex === -1) {
            errors.push({
              row: rowIndex + 2,
              column: col.header,
              message: `Không tìm thấy cột "${col.header}" trong file`,
            });
            rowHasError = true;
            return;
          }

          const rawValue = String(row[colIndex] ?? '').trim();

          if (col.required && !rawValue) {
            errors.push({
              row: rowIndex + 2,
              column: col.header,
              message: `Trường "${col.header}" là bắt buộc`,
            });
            rowHasError = true;
            return;
          }

          record[col.key as string] = col.importParser ? col.importParser(rawValue) : rawValue;
        });

        // Chỉ push row hợp lệ
        if (!rowHasError) {
          parsed.push(record as T);
        }
      });

      if (errors.length > 0) {
        onError?.(errors);
        // Nếu không continueOnError thì dừng, không gọi onImport
        if (!continueOnError) return;
      }

      if (parsed.length > 0) {
        await onImport(parsed);
      }
    },
    [],
  );

  const handleFileChange = useCallback(
    async <T>(e: React.ChangeEvent<HTMLInputElement>, config: ExcelImportConfig<T>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        setIsImporting(true);
        await parseFile(file, config);
      } finally {
        setIsImporting(false);
        // Reset để có thể chọn lại cùng file
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [parseFile],
  );

  /**
   * Bind sẵn config vào handler — dùng khi muốn gọn hơn ở JSX:
   *
   * ```tsx
   * <input onChange={bindImport(myImportConfig)} />
   * ```
   */
  const bindImport = useCallback(
    <T>(config: ExcelImportConfig<T>) =>
      (e: React.ChangeEvent<HTMLInputElement>) =>
        handleFileChange(e, config),
    [handleFileChange],
  );

  return {
    fileInputRef,
    isImporting,
    exportToExcel,
    exportTemplate,
    triggerImport,
    handleFileChange,
    bindImport,
  };
};
