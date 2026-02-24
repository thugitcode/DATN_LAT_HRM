import type { BaseColumn, Column, ColumnGroup, HeaderCell } from './types';

export function isColumnGroup<T extends object>(col: Column<T>): col is ColumnGroup<T> {
  return (
    Array.isArray((col as ColumnGroup<T>).children) && (col as ColumnGroup<T>).children.length > 0
  );
}

export function getMaxDepth<T extends object>(cols: Column<T>[], depth = 1): number {
  return cols.reduce((max, col) => {
    if (isColumnGroup(col)) {
      return Math.max(max, getMaxDepth(col.children, depth + 1));
    }
    return max;
  }, depth);
}

export function getLeafCount<T extends object>(cols: Column<T>[]): number {
  return cols.reduce((count, col) => {
    return count + (isColumnGroup(col) ? getLeafCount(col.children) : 1);
  }, 0);
}

export function getLeafColumns<T extends object>(cols: Column<T>[]): BaseColumn<T>[] {
  return cols.flatMap((col) => (isColumnGroup(col) ? getLeafColumns(col.children) : [col]));
}

export function buildHeaderRows<T extends object>(columns: Column<T>[]): HeaderCell<T>[][] {
  const maxDepth = getMaxDepth(columns);
  const rows: HeaderCell<T>[][] = Array.from({ length: maxDepth }, () => []);

  function processCol(col: Column<T>, depth: number): void {
    if (isColumnGroup(col)) {
      rows?.[depth]?.push({
        ...col,
        colSpan: getLeafCount(col.children),
        rowSpan: 1,
      });
      col.children.forEach((child) => processCol(child, depth + 1));
    } else {
      rows?.[depth]?.push({
        ...col,
        colSpan: 1,
        rowSpan: maxDepth - depth,
      });
    }
  }

  columns.forEach((col) => processCol(col, 0));
  return rows;
}

const DEFAULT_COLUMN_WIDTH = 100;

export function calcFixedLeft<T extends object>(
  leafColumns: BaseColumn<T>[],
  index: number,
): number {
  return leafColumns.slice(0, index).reduce((acc, col) => {
    if (col.fixed !== 'left') return acc;
    return acc + (typeof col.width === 'number' ? col.width : DEFAULT_COLUMN_WIDTH);
  }, 0);
}

export function getRowKey<T extends object>(
  record: T,
  index: number,
  rowKey: keyof T | ((record: T) => string),
): string {
  if (typeof rowKey === 'function') return rowKey(record);

  const value = record[rowKey];
  return value != null ? String(value) : `row-${index}`;
}
