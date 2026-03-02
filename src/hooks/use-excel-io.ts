import { useCallback, useRef } from 'react';
import * as XLSX from 'xlsx';

/**
 * Column definition for Excel export/import
 */
export interface ExcelColumnDef<T = Record<string, unknown>> {
  /** Header label shown in Excel */
  header: string;
  /** Key to access value from data object (for export) */
  key: keyof T | string;
  /** Width of column in Excel (chars) */
  width?: number;
  /** Format cell value before writing to Excel */
  exportFormatter?: (value: unknown, row: T) => string | number;
  /** Parse cell value when reading from Excel */
  importParser?: (value: unknown) => unknown;
  /** Whether column is required during import */
  required?: boolean;
  /** Example value shown in template row */
  example?: string | number;
}

export interface ExcelExportConfig<T = Record<string, unknown>> {
  /** File name (without .xlsx) */
  fileName: string;
  /** Sheet name */
  sheetName?: string;
  /** Column definitions */
  columns: ExcelColumnDef<T>[];
  /** Whether to include an example row in the template */
  includeExampleRow?: boolean;
}

export interface ExcelImportConfig<T = Record<string, unknown>> {
  /** Column definitions used to map headers -> keys */
  columns: ExcelColumnDef<T>[];
  /** Called with parsed rows after import */
  onImport: (rows: T[]) => void | Promise<void>;
  /** Called when validation fails */
  onError?: (errors: ImportError[]) => void;
  /** Max file size in MB */
  maxFileSizeMB?: number;
}

export interface ImportError {
  row: number;
  column: string;
  message: string;
}

const HEADER_STYLE = {
  font: { bold: true, color: { rgb: 'FFFFFF' } },
  fill: { fgColor: { rgb: '2563EB' } },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
  border: {
    top: { style: 'thin', color: { rgb: 'FFFFFF' } },
    bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
    left: { style: 'thin', color: { rgb: 'FFFFFF' } },
    right: { style: 'thin', color: { rgb: 'FFFFFF' } },
  },
};

const EXAMPLE_STYLE = {
  font: { italic: true, color: { rgb: '6B7280' } },
  fill: { fgColor: { rgb: 'F9FAFB' } },
  alignment: { horizontal: 'left', vertical: 'center' },
};

/**
 * Apply cell styles — requires xlsx-style or sheetjs-style;
 * if not available styles are skipped gracefully.
 */
function tryApplyStyle(ws: XLSX.WorkSheet, cellRef: string, style: unknown) {
  try {
    const cell = ws[cellRef];
    if (cell) (cell as Record<string, unknown>).s = style;
  } catch {
    // xlsx community edition doesn't support styles — silently skip
  }
}

export function useExcelIO() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ─── EXPORT ──────────────────────────────────────────────────────────────

  /**
   * Export data rows to Excel.
   * Pass an empty array [] to export a blank template.
   */
  const exportToExcel = useCallback(
    <T extends Record<string, unknown>>(data: T[], config: ExcelExportConfig<T>) => {
      const { fileName, sheetName = 'Sheet1', columns, includeExampleRow = true } = config;

      const wb = XLSX.utils.book_new();

      // Header row
      const headerRow = columns.map((col) => col.header);

      // Rows
      const dataRows = data.map((row) =>
        columns.map((col) => {
          const raw = row[col.key as keyof T];
          return col.exportFormatter ? col.exportFormatter(raw, row) : (raw ?? '');
        }),
      );

      const exampleRow =
        includeExampleRow && data.length === 0 ? columns.map((col) => col.example ?? '') : null;

      const aoa = [headerRow, ...(exampleRow ? [exampleRow] : []), ...dataRows];

      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Column widths
      ws['!cols'] = columns.map((col) => ({ wch: col.width ?? 20 }));

      // Freeze header row
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      // Apply styles to header
      columns.forEach((_, ci) => {
        const cellRef = XLSX.utils.encode_cell({ r: 0, c: ci });
        tryApplyStyle(ws, cellRef, HEADER_STYLE);
      });

      // Style example row
      if (exampleRow) {
        columns.forEach((_, ci) => {
          const cellRef = XLSX.utils.encode_cell({ r: 1, c: ci });
          tryApplyStyle(ws, cellRef, EXAMPLE_STYLE);
        });
      }

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, `${fileName}.xlsx`);
    },
    [],
  );

  /**
   * Export just the empty template (with example row).
   */
  const exportTemplate = useCallback(
    <T extends Record<string, unknown>>(config: ExcelExportConfig<T>) => {
      exportToExcel([], { ...config, includeExampleRow: true });
    },
    [exportToExcel],
  );

  // ─── IMPORT ──────────────────────────────────────────────────────────────

  /**
   * Trigger native file input for Excel import.
   */
  const triggerImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Parse an Excel file using the provided column config.
   * Returns parsed rows and validation errors.
   */
  const parseExcelFile = useCallback(
    <T extends Record<string, unknown>>(
      file: File,
      config: ExcelImportConfig<T>,
    ): Promise<{ rows: T[]; errors: ImportError[] }> => {
      return new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target!.result as ArrayBuffer);
            const wb = XLSX.read(data, { type: 'array' });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
              defval: '',
            });

            const errors: ImportError[] = [];
            const rows: T[] = [];

            // Build header->key map
            const headerToKey = new Map(config.columns.map((col) => [col.header, col]));

            raw.forEach((rawRow, rowIdx) => {
              const parsed: Record<string, unknown> = {};

              config.columns.forEach((col) => {
                const rawVal = rawRow[col.header];

                if (col.required && (rawVal === undefined || rawVal === null || rawVal === '')) {
                  errors.push({
                    row: rowIdx + 2, // +2: header row + 1-indexed
                    column: col.header,
                    message: `"${col.header}" là bắt buộc`,
                  });
                }

                parsed[col.key as string] = col.importParser ? col.importParser(rawVal) : rawVal;
              });

              rows.push(parsed as T);
            });

            resolve({ rows, errors });
          } catch (err) {
            resolve({
              rows: [],
              errors: [{ row: 0, column: '', message: String(err) }],
            });
          }
        };

        reader.readAsArrayBuffer(file);
      });
    },
    [],
  );

  /**
   * Handle file input change event — validates size, parses, calls onImport/onError.
   */
  const handleFileChange = useCallback(
    async <T extends Record<string, unknown>>(
      e: React.ChangeEvent<HTMLInputElement>,
      config: ExcelImportConfig<T>,
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Reset input so same file can be re-imported
      e.target.value = '';

      const maxMB = config.maxFileSizeMB ?? 10;
      if (file.size > maxMB * 1024 * 1024) {
        config.onError?.([
          {
            row: 0,
            column: '',
            message: `File vượt quá ${maxMB}MB`,
          },
        ]);
        return;
      }

      const { rows, errors } = await parseExcelFile(file, config);

      if (errors.length > 0) {
        config.onError?.(errors);
        return;
      }

      await config.onImport(rows);
    },
    [parseExcelFile],
  );

  return {
    fileInputRef,
    exportToExcel,
    exportTemplate,
    triggerImport,
    parseExcelFile,
    handleFileChange,
  };
}
