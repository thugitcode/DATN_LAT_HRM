import type { ReactNode } from 'react';

export type RecordType = Record<string, unknown>;

export interface BaseColumn<T = RecordType> {
  key: string;
  dataIndex?: keyof T | string;
  title?: ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  fixed?: 'left' | 'right';
  render?: (value: unknown, record: T, index: number) => ReactNode;
  onCell?: (record: T, index: number) => React.TdHTMLAttributes<HTMLTableCellElement>;
  onHeaderCell?: () => React.ThHTMLAttributes<HTMLTableHeaderCellElement>;
}

export interface ColumnGroup<T = RecordType> extends BaseColumn<T> {
  children?: Column<T>[];
}

export type Column<T = RecordType> = BaseColumn<T> | ColumnGroup<T>;

export interface PaginationConfig {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  onChange?: (page: number, pageSize: number) => void;
  onShowSizeChange?: (current: number, size: number) => void;
}

export interface TableProps<T = RecordType> {
  columns: Column<T>[];
  dataSource: T[];
  rowKey?: keyof T | string | ((record: T) => string);
  className?: string;
  bordered?: boolean;
  size?: 'small' | 'middle' | 'large';
  loading?: boolean;
  rowClassName?: string | ((record: T, index: number) => string);
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
  pagination?: false | PaginationConfig;
}

export interface HeaderStructure<T> {
  rows: Array<Array<Column<T> & { colSpan?: number; rowSpan?: number }>>;
  leafColumns: BaseColumn<T>[];
  maxDepth: number;
}
