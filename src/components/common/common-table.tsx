import { memo } from "react";
import { Box, Group, Text } from "@mantine/core";
import clsx from "clsx";
import { DataTable, type DataTableColumn, type DataTableProps, type DataTableRowClickHandler } from "mantine-datatable";



import { Icons } from "../icons";
import styles from "./common.module.css";


const PAGE_OPTIONS = [10, 25, 50, 100];

export type CommonTableProps<T> = {
  columns: DataTableColumn<T>[];
  records?: T[];
  loading?: boolean;
  pinLastColumn?: boolean;
  onRowClick?: DataTableRowClickHandler<T>;
  totalRecords?: number;
  page?: number;
  setPage?: (page: number) => void;
  limit?: number;
  setLimit?: (limit: number) => void;
  selectedRecords?: T[];
  onSelectedRecordsChange?: (records: T[]) => void;
  highlightOnHover?: boolean;
  rowKey?: DataTableProps<T>["idAccessor"];
  classNames?: DataTableProps<T>["classNames"];
  height?: string | number;
  width?: string | number;
  mah?: string | number;
};

const CommonTableInner = <T,>({
  columns,
  records = [],
  loading = false,
  pinLastColumn = false,
  onRowClick,
  totalRecords,
  page,
  setPage,
  limit,
  setLimit,
  selectedRecords,
  onSelectedRecordsChange,
  highlightOnHover = true,
  rowKey,
  classNames,
  height,
  width,
  mah
}: CommonTableProps<T>) => {
  const isShowPagination = totalRecords && page && setPage && limit && setLimit;
  const commonProps: DataTableProps<T> = {
    columns,
    records,
    fetching: loading,
    verticalSpacing: "xs",
    pinLastColumn,
    scrollAreaProps: { type: "always", offsetScrollbars: "x" },
    onRowClick,
    noRecordsText: "Không có dữ liệu",
    noRecordsIcon: <Box component={Icons.noData} mb="xs" w={40} />,
    highlightOnHover: highlightOnHover,
    selectedRecords,
    onSelectedRecordsChange,
    idAccessor: rowKey,
    minHeight: records.length === 0 ? 500 : undefined,
    classNames: {
      ...classNames,
      table: clsx(styles.table, classNames?.table),
      header: clsx(styles.header, classNames?.header),
      root: styles.root
    },
    className: styles["common-table"],
    height: height,
    w: width,
    mah: mah,
  };

  if (isShowPagination) {
    return (
      <DataTable<T>
        {...commonProps}
        totalRecords={totalRecords}
        page={page ?? 0}
        onPageChange={setPage ?? (() => {})}
        recordsPerPage={limit ?? 0}
        onRecordsPerPageChange={handleLimitChange}
        recordsPerPageOptions={PAGE_OPTIONS}
        recordsPerPageLabel="Hiển thị"
        paginationActiveBackgroundColor="#6576ff"
        paginationText={() => 'Trên trang'}
        paginationWithControls={true}
        backgroundColor={'transparent'}
        styles={{
          pagination: {
            '& .mantine-Button-root': {
              backgroundColor: 'black',
              borderRadius: '8px',
              '--button-bg': 'black',
              border: 'none !important',
            },
          },
        }}
        renderPagination={({ state, actions, Controls }) => (
          <>
            <Controls.Text />
            <Controls.PageSizeSelector />
            <Group gap={2.5}>
              <Text
                size="sm"
                c={state.page === 1 ? '#ccc' : '#868CAA'}
                style={{ cursor: state.page === 1 ? 'not-allowed' : 'pointer' }}
                onClick={() => {
                  if (state.page > 1) {
                    actions.setPage(state.page - 1);
                  }
                }}
              >
                Trước
              </Text>
              <Controls.Pagination
                styles={{
                  control: {
                    border: 'none',
                    size: 32,
                    width: '32px',
                    height: '32px',
                  },
                }}
              />
              <Text
                size="sm"
                c={state.page === state.totalPages ? '#ccc' : '#868CAA'}
                style={{
                  cursor: state.page === state.totalPages ? 'not-allowed' : 'pointer',
                }}
                onClick={() => {
                  if (state.page < state.totalPages) {
                    actions.setPage(state.page + 1);
                  }
                }}
              >
                Tiếp
              </Text>
            </Group>
          </>
        )}
      />
    );
  }

  return <DataTable<T> {...commonProps} />;

  function handleLimitChange(limit: number) {
    setPage?.(1);
    setLimit?.(limit);
  }
};

// Export memoized version
export const CommonTable = memo(CommonTableInner) as typeof CommonTableInner;