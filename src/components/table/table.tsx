import { useMemo, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { TablePagination } from './table-pagination';
import type { TableProps } from './types';
import { buildHeaderRows, calcFixedLeft, getLeafColumns, getRowKey } from './utils';

const SIZE_CLASS = {
  small: 'text-xs',
  middle: 'text-sm',
  large: 'text-base',
} as const;

const ALIGN_CLASS = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
} as const;

export function Table<T extends object = object>({
  columns,
  dataSource,
  rowKey,
  className,
  bordered = false,
  size = 'middle',
  loading = false,
  empty,
  rowClassName,
  onRow,
  pagination,
}: TableProps<T>) {
  const headerRows = useMemo(() => buildHeaderRows(columns), [columns]);
  const leafColumns = useMemo(() => getLeafColumns(columns), [columns]);
  const resolvedRowKey = rowKey ?? ('id' as keyof T);

  const sizeClass = SIZE_CLASS[size];

  const thBase = cn(
    'px-4 py-3 font-semibold text-xs text-[#71717A] bg-[#F4F4F5] text-nowrap',
    bordered && 'border border-gray-300',
  );

  const tdBase = cn('px-4 py-3', bordered && 'border border-gray-300');

  const isEmpty = !loading && dataSource.length === 0;

  return (
    <div className="flex flex-col gap-4 justify-between h-full flex-1 bg-white rounded-[14px] p-4">
      <div className={cn('overflow-auto bg-white', className)}>
        <table className="w-full border-collapse ">
          <thead className="sticky top-0 z-30">
            {headerRows.map((row, rowIndex) => (
              <tr key={`header-row-${rowIndex}`}>
                {row.map((col, colIndex) => {
                  const headerCellProps = col.onHeaderCell?.() ?? {};
                  const fixedStyle =
                    col.fixed === 'left' ? { left: calcFixedLeft(leafColumns, colIndex) } : {};

                  return (
                    <th
                      key={`${col.key}-${colIndex}`}
                      colSpan={col.colSpan}
                      rowSpan={col.rowSpan}
                      className={cn(
                        thBase,
                        col.fixed && 'sticky z-40',
                        ALIGN_CLASS[col.align ?? 'left'],
                        sizeClass,
                        col.className,
                      )}
                      style={{ width: col.width, ...fixedStyle, ...headerCellProps.style }}
                      {...headerCellProps}
                    >
                      {col.title}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {loading ? (
              <>
                {Array.from({ length: 10 }).map((_, rowIndex) => (
                  <tr
                    key={`skeleton-${rowIndex}`}
                    className="animate-pulse border-b border-gray-100"
                  >
                    {leafColumns.map((col, colIndex) => (
                      <td
                        key={`skeleton-${rowIndex}-${colIndex}`}
                        className={cn(tdBase, sizeClass)}
                        style={{ width: col.width }}
                      >
                        <div
                          className="h-3.5 bg-gray-200 rounded-full"
                          style={{ width: `${55 + ((rowIndex * 13 + colIndex * 7) % 35)}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </>
            ) : isEmpty ? (
              <TablePlaceholder
                colSpan={leafColumns.length}
                message={empty ?? 'Không có dữ liệu'}
              />
            ) : (
              dataSource.map((record, rowIndex) => {
                const rowProps = onRow?.(record, rowIndex) ?? {};
                const rKey = getRowKey(record, rowIndex, resolvedRowKey);
                const rClass =
                  typeof rowClassName === 'function'
                    ? rowClassName(record, rowIndex)
                    : (rowClassName ?? '');

                return (
                  <tr
                    key={rKey}
                    className={cn('hover:bg-gray-50 transition-colors', rClass)}
                    {...rowProps}
                  >
                    {leafColumns.map((col, colIndex) => {
                      const cellProps = col.onCell?.(record, rowIndex) ?? {};
                      const value = col.dataIndex
                        ? (record as Record<string, unknown>)[col.dataIndex]
                        : undefined;
                      const fixedStyle =
                        col.fixed === 'left' ? { left: calcFixedLeft(leafColumns, colIndex) } : {};

                      return (
                        <td
                          key={`${rKey}-${col.key}`}
                          className={cn(
                            tdBase,
                            col.fixed && 'sticky z-20 bg-white',
                            ALIGN_CLASS[col.align ?? 'left'],
                            sizeClass,
                            col.className,
                          )}
                          style={{ width: col.width, ...fixedStyle, ...cellProps.style }}
                          {...cellProps}
                        >
                          {col.render ? col.render(value, record, rowIndex) : (value as ReactNode)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination !== false && pagination && <TablePagination />}
    </div>
  );
}

// ✅ Empty/loading state dùng chung 1 component, accept ReactNode cho message
function TablePlaceholder({ colSpan, message }: { colSpan: number; message: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="text-center py-8 text-gray-500">
        {message}
      </td>
    </tr>
  );
}
