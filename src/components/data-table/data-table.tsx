import { useCallback, type Key, type ReactNode } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import {
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import type { Selection } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { TablePagination } from '../table/table-pagination';
import type { PaginationConfig } from '../table/types';

export interface ColumnDef<T extends object> {
  key: string;
  title: ReactNode;
  dataIndex?: keyof T & string;
  width?: number | string;
  minWidth?: number;
  align?: 'start' | 'center' | 'end';
  className?: string;
  hideable?: boolean;
  sticky?: 'left' | 'right';

  render?: (value: unknown, record: T, index: number) => ReactNode;
}

export interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[];
  dataSource: T[];
  rowKey?: keyof T & string;
  loading?: boolean;
  emptyContent?: ReactNode;
  pagination?: false | PaginationConfig;
  selectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  disabledKeys?: Iterable<Key>;
  selectionMode?: 'none' | 'single' | 'multiple';
  classNames?: {
    wrapper?: string;
    th?: string;
    td?: string;
    tr?: string;
  };

  visibleColumns?: Set<string>;
  onVisibleColumnsChange?: (visibleKeys: Set<string>) => void;
  onRowClick?: (record: T) => void;
  isHeaderSticky?: boolean;
}

export function DataTable<T extends object>({
  columns,
  dataSource,
  rowKey = 'id' as keyof T & string,
  loading = false,
  emptyContent,
  pagination,
  selectedKeys,
  onSelectionChange,
  selectionMode = 'multiple',
  visibleColumns,
  classNames,
  onRowClick,
  isHeaderSticky,
}: DataTableProps<T>) {
  const { t } = useTranslation(NAMESPACES.COMMON);

  const visibleColumnDefs = visibleColumns
    ? columns.filter((col) => visibleColumns.has(col.key))
    : columns;

  const getRowKey = (record: T, index: number): string => {
    const val = record[rowKey];
    return val !== undefined && val !== null ? String(val) : String(index);
  };

  const renderCell = useCallback(
    (record: T, columnKey: Key): ReactNode => {
      const col = columns.find((c) => c.key === String(columnKey));
      if (!col) return null;

      const items = Array.isArray(dataSource) ? dataSource : [];
      const index = items.indexOf(record);
      const value = col.dataIndex ? record[col.dataIndex] : undefined;

      if (col.render) return col.render(value as unknown, record, index);

      return value !== undefined && value !== null ? String(value) : '—';
    },
    [columns, dataSource],
  );

  const items = Array.isArray(dataSource) ? dataSource : [];

  const resolvedEmptyContent = emptyContent ?? t('table.empty');

  const getStickyStyle = (col: ColumnDef<T>, allCols: ColumnDef<T>[]) => {
    if (!col.sticky) return {};

    const toNumber = (w?: number | string) =>
      typeof w === 'number' ? w : parseInt(w ?? '0', 10) || 0;

    if (col.sticky === 'left') {
      let offset = 0;
      for (const c of allCols) {
        if (c.key === col.key) break;
        if (c.sticky === 'left') offset += toNumber(c.width);
      }
      return {
        position: 'sticky' as const,
        left: offset,
        zIndex: 10,
      };
    }

    if (col.sticky === 'right') {
      let offset = 0;
      const reversed = [...allCols].reverse();
      for (const c of reversed) {
        if (c.key === col.key) break;
        if (c.sticky === 'right') offset += toNumber(c.width);
      }
      return {
        position: 'sticky' as const,
        right: offset,
        zIndex: 10,
      };
    }

    return {};
  };

  return (
    <div className="flex flex-col gap-4">
      <Table
        isHeaderSticky={isHeaderSticky}
        aria-label="Data table"
        selectionMode={selectionMode}
        selectedKeys={selectedKeys}
        onSelectionChange={onSelectionChange}
        classNames={{
          wrapper: `shadow-none border border-gray-200 rounded-xl border-0 pr-0 rounded-none bg-white ${classNames?.wrapper}`,
          th:
            classNames?.th ??
            'bg-[#F4F4F5] text-[#71717A] text-xs font-semibold uppercase py-3 px-4 first:rounded-none last:rounded-none',
          td: classNames?.td ?? 'py-3 px-4',
          tr:
            classNames?.tr ??
            'hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0',
        }}
      >
        <TableHeader>
          {visibleColumnDefs.map((col) => (
            <TableColumn
              key={col.key}
              align={col.align ?? 'start'}
              className={
                col.sticky === 'right' ? `sticky-right-cell ${col.className ?? ''}` : col.className
              }
              style={{
                width: col.width,
                minWidth: col.minWidth,
                ...getStickyStyle(col, visibleColumnDefs),
                backgroundColor: col.sticky ? '#F4F4F5' : undefined,
              }}
            >
              {col.title}
            </TableColumn>
          ))}
        </TableHeader>

        <TableBody
          items={items}
          isLoading={loading}
          loadingContent={<Spinner />}
          emptyContent={resolvedEmptyContent}
        >
          {(record) => (
            <TableRow
              key={getRowKey(record, items.indexOf(record))}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onRowClick?.(record);
              }}
            >
              {visibleColumnDefs.map((col) => (
                <TableCell
                  key={col.key}
                  className={col.sticky === 'right' ? 'sticky-right-cell ' : undefined}
                  style={{
                    ...getStickyStyle(col, visibleColumnDefs),
                    backgroundColor: col.sticky ? 'white' : undefined,
                  }}
                >
                  {renderCell(record, col.key)}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {pagination !== false && pagination && <TablePagination total={pagination.totalPage} />}
    </div>
  );
}
export default DataTable;
