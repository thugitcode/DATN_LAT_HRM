import type { ColumnDef } from '@/components/data-table/data-table';
import type { PaginationConfig } from '@/components/table/types';

import type { GeneralRequest } from '../../types/generate-request.type';

export type Translator = (key: string, options?: object) => string;

export type ExportFn = (opts: {
  data: GeneralRequest[];
  month?: string;
  companyName: string;
  unitName: string;
  departmentName?: string;
  t: Translator;
}) => void;

export interface ExportConfig {
  data: GeneralRequest[];
  month?: string;
  companyName: string;
  unitName: string;
  departmentName?: string;
  exportFn: ExportFn;
}

export interface RequestManagementPageProps<TData extends object> {
  title: string;
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading: boolean;
  pagination: PaginationConfig;
  onExport: () => void;
  onPrint: () => void;
  visibleColumns: Set<string>;
  onApplyColumns: (visibleKeys: Set<string>, saveAsDefault: boolean) => void;
  printContent: React.ReactNode;
}
