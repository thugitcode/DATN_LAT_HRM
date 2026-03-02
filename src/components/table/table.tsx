import { useMemo, type ReactNode } from 'react';
import { Spinner } from '@heroui/react';

import { cn } from '@/lib/utils';

import { TableEmpty } from './table-empty';
import { TableLoading } from './table-loading';
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

  const isEmpty = !loading && !dataSource.length;

  return (
    <div className="flex flex-col gap-4 justify-between h-full flex-1 bg-white rounded-[14px] p-4">
      <div className={cn('overflow-auto relative bg-white', className)}>
        <table className="w-full border-collapse  ">
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

          <tbody className="relative ">
            {isEmpty ? (
              <TableEmpty />
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
                    className={cn(
                      'hover:bg-gray-50 transition-colors group border-b border-gray-200',
                      rClass,
                    )}
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
                            col.fixed && 'sticky z-20 bg-white group-hover:bg-gray-50',

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

        {loading && <TableLoading />}
      </div>

      {pagination !== false && pagination && <TablePagination total={pagination.totalPage} />}
    </div>
  );
}
