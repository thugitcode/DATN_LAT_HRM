import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react';

type Align = 'left' | 'center' | 'right';
type Size = 'small' | 'middle' | 'large';
type Fixed = 'left' | 'right';

export type DataIndex<T> = keyof T & string;

interface CellHandlers<T> {
  onCell?: (record: T, index: number) => TdHTMLAttributes<HTMLTableCellElement>;
  onHeaderCell?: () => ThHTMLAttributes<HTMLTableHeaderCellElement>;
}

export interface BaseColumn<T extends object = object> extends CellHandlers<T> {
  key: string;
  dataIndex?: DataIndex<T>;
  title?: ReactNode;
  width?: number | string;
  align?: Align;
  className?: string;
  fixed?: Fixed;
  render?: (value: unknown, record: T, index: number) => ReactNode;
}

export interface ColumnGroup<T extends object = object> extends BaseColumn<T> {
  children: BaseColumn<T>[];
}

export type Column<T extends object = object> =
  | (BaseColumn<T> & { children?: never })
  | ColumnGroup<T>;

export function isColumnGroup<T extends object>(col: Column<T>): col is ColumnGroup<T> {
  return Array.isArray((col as ColumnGroup<T>).children);
}

export interface PaginationConfig {
  current?: number;
  pageSize?: number;
  total?: number;
  totalPage?: number;
  showSizeChanger?: boolean;
  pageSizeOptions?: number[];
  onChange?: (page: number, pageSize: number) => void;
}

export interface TableProps<T extends object = object> {
  columns: Column<T>[];
  dataSource: T[];
  rowKey?: DataIndex<T> | ((record: T) => string);
  className?: string;
  bordered?: boolean;
  size?: Size;
  loading?: boolean;
  empty?: ReactNode;
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  rowClassName?: string | ((record: T, index: number) => string);
  pagination?: false | PaginationConfig;
}

export interface HeaderCell<T extends object = object> extends BaseColumn<T> {
  colSpan?: number;
  rowSpan?: number;
}
