import React, { useState, type ReactNode } from 'react';
import { Pagination } from '@heroui/react';

import { cn } from '@/lib/utils';

import { TablePagination } from './table-pagination';

type RecordType = Record<string, unknown>;

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

interface TableProps<T = RecordType> {
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

export function Table<T = RecordType>({
  columns,
  dataSource,
  rowKey = 'id',
  className = '',
  bordered = false,
  size = 'middle',
  loading = false,
  rowClassName,
  onRow,
  pagination,
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = useState(pagination?.current || 1);
  const [pageSize, setPageSize] = useState(pagination?.pageSize || 10);

  const hasPagination = pagination !== false;
  const totalRecords = pagination?.total || dataSource.length;
  const totalPages = Math.ceil(totalRecords / pageSize);

  const paginatedData = hasPagination
    ? dataSource.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : dataSource;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    pagination?.onChange?.(page, pageSize);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    pagination?.onShowSizeChange?.(1, newPageSize);
    pagination?.onChange?.(1, newPageSize);
  };

  const getHeaderStructure = () => {
    const maxDepth = getMaxDepth(columns);
    const rows: Column<T>[][] = Array.from({ length: maxDepth }, () => []);

    const processColumn = (col: Column<T>, depth: number, parentWidth: number = 1) => {
      const columnGroup = col as ColumnGroup<T>;

      if (columnGroup.children && columnGroup.children.length > 0) {
        rows[depth].push({
          ...col,
          colSpan: getLeafColumnsCount(columnGroup.children),
        });

        columnGroup.children.forEach((child) => {
          processColumn(child, depth + 1, parentWidth);
        });
      } else {
        // Leaf column
        rows[depth].push({
          ...col,
          rowSpan: maxDepth - depth,
        });
      }
    };

    columns.forEach((col) => processColumn(col, 0));
    return rows;
  };

  const getMaxDepth = (cols: Column<T>[], depth: number = 1): number => {
    let maxChildDepth = depth;
    cols.forEach((col) => {
      const columnGroup = col as ColumnGroup<T>;
      if (columnGroup.children && columnGroup.children.length > 0) {
        const childDepth = getMaxDepth(columnGroup.children, depth + 1);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      }
    });
    return maxChildDepth;
  };

  const getLeafColumnsCount = (cols: Column<T>[]): number => {
    let count = 0;
    cols.forEach((col) => {
      const columnGroup = col as ColumnGroup<T>;
      if (columnGroup.children && columnGroup.children.length > 0) {
        count += getLeafColumnsCount(columnGroup.children);
      } else {
        count += 1;
      }
    });
    return count;
  };

  const getLeafColumns = (cols: Column<T>[]): BaseColumn<T>[] => {
    const leaves: BaseColumn<T>[] = [];
    cols.forEach((col) => {
      const columnGroup = col as ColumnGroup<T>;
      if (columnGroup.children && columnGroup.children.length > 0) {
        leaves.push(...getLeafColumns(columnGroup.children));
      } else {
        leaves.push(col as BaseColumn<T>);
      }
    });
    return leaves;
  };

  const headerRows = getHeaderStructure();
  const leafColumns = getLeafColumns(columns);

  const getCellValue = (record: T, col: BaseColumn<T>) => {
    if (col.dataIndex) {
      return (record as Record<string, unknown>)[col.dataIndex as string];
    }
    return undefined;
  };

  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    const key = (record as Record<string, unknown>)[rowKey as string];
    return String(key) || `row-${index}`;
  };

  const getRowClassName = (record: T, index: number): string => {
    if (typeof rowClassName === 'function') {
      return rowClassName(record, index);
    }
    return rowClassName || '';
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const getFixedStyle = (fixed?: 'left' | 'right', index?: number) => {
    if (!fixed) return {};

    if (fixed === 'left') {
      let leftPos = 0;
      if (index !== undefined) {
        for (let i = 0; i < index; i++) {
          const col = leafColumns[i];
          if (col.fixed === 'left') {
            const width = typeof col.width === 'number' ? col.width : 100;
            leftPos += width;
          }
        }
      }
      return { left: `${leftPos}px` };
    }

    return {};
  };

  return (
    <div className="flex flex-col gap-4 justify-between h-full">
      <div className={cn('overflow-auto bg-white ', className)}>
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-30 ">
            {headerRows.map((row, rowIndex) => (
              <tr key={`header-row-${rowIndex}`}>
                {row.map((col, colIndex) => {
                  const headerCellProps = col.onHeaderCell?.() || {};
                  const isFixed = col.fixed === 'left' || col.fixed === 'right';
                  const fixedStyle = getFixedStyle(col.fixed, colIndex);

                  return (
                    <th
                      key={`${col.key}-${colIndex}`}
                      colSpan={(col as ColumnGroup).colSpan}
                      rowSpan={(col as ColumnGroup).rowSpan}
                      className={cn(
                        'px-4 py-3 font-semibold text-xs text-[#71717A] bg-[#F4F4F5] m-0!',
                        bordered ? 'border border-gray-300' : '',
                        isFixed ? 'sticky z-40 ' : '',
                        getAlignClass(col.align),
                        getSizeClass(),
                        col.className || '',
                      )}
                      style={{
                        width: col.width,
                        ...fixedStyle,
                        ...headerCellProps.style,
                      }}
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
              <tr>
                <td colSpan={leafColumns.length} className="text-center py-8 text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={leafColumns.length} className="text-center py-8 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              paginatedData.map((record, rowIndex) => {
                const rowProps = onRow?.(record, rowIndex) || {};
                const rKey = getRowKey(record, rowIndex);
                const rClassName = getRowClassName(record, rowIndex);

                return (
                  <tr
                    key={rKey}
                    className={`hover:bg-gray-50 transition-colors ${rClassName}`}
                    {...rowProps}
                  >
                    {leafColumns.map((col, colIndex) => {
                      const cellProps = col.onCell?.(record, rowIndex) || {};
                      const value = getCellValue(record, col);
                      const isFixed = col.fixed === 'left' || col.fixed === 'right';
                      const fixedStyle = getFixedStyle(col.fixed, colIndex);

                      return (
                        <td
                          key={`${rKey}-${col.key}`}
                          className={`
                            px-4 py-3
                            ${bordered ? 'border border-gray-300' : ''}
                            ${isFixed ? 'sticky z-20 bg-white' : ''}
                            ${getAlignClass(col.align)}
                            ${getSizeClass()}
                            ${col.className || ''}
                          `}
                          style={{
                            width: col.width,
                            ...fixedStyle,
                            ...cellProps.style,
                          }}
                          {...cellProps}
                        >
                          {col.render ? col.render(value, record, rowIndex) : value}
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

      {/* {hasPagination && (
        <div className="flex items-center justify-between">
          {pagination?.showSizeChanger !== false && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(pagination?.pageSizeOptions || [10, 20, 50, 100]).map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span className="text-sm text-gray-600">/ trang</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                px-3 py-1.5 border border-gray-300 rounded-md text-sm
                ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}
              `}
            >
              Trước
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (currentPage <= 4) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = currentPage - 3 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`
                      w-9 h-9 border rounded-md text-sm
                      ${
                        currentPage === pageNum
                          ? 'bg-blue-500 text-white border-blue-500'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                px-3 py-1.5 border border-gray-300 rounded-md text-sm
                ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}
              `}
            >
              Sau
            </button>
          </div>

          <div className="text-sm text-gray-600">Tổng {totalRecords} bản ghi</div>
        </div>
      )} */}
      <TablePagination />
    </div>
  );
}
