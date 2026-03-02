import { useCallback, type Key } from 'react';
import {
  Button,
  Chip,
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { IconCheck, IconPaperclip, IconX } from '@tabler/icons-react';

import { AttendanceExplanationStatus, type AttendanceExplanation } from '../types';

interface Props {
  data: AttendanceExplanation[];
  totalPages?: number;
  currentPage?: number;
  isLoading?: boolean;
  selectedKeys?: Selection;
  onSelectionChange?: (keys: Selection) => void;
  onPageChange?: (page: number) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

// ─── Columns ──────────────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'departmentName', label: 'KHOA/PHÒNG', minWidth: 120 },
  { key: 'staffCode', label: 'MÃ NHÂN VIÊN', minWidth: 120 },
  { key: 'staffName', label: 'TÊN NHÂN VIÊN', minWidth: 130 },
  { key: 'position', label: 'CHỨC VỤ', minWidth: 80 },
  { key: 'date', label: 'NGÀY', minWidth: 100 },
  { key: 'typeLabel', label: 'LOẠI LỖI', minWidth: 100 },
  { key: 'reason', label: 'GIẢI TRÌNH', minWidth: 80 },
  { key: 'attachment', label: 'FILE ĐÍNH KÈM', minWidth: 140 },
  { key: 'managerName', label: 'QUẢN LÝ QUYẾT', minWidth: 130 },
  { key: 'status', label: 'HÀNH ĐỘNG', minWidth: 160 },
];

// ─── Status Cell ──────────────────────────────────────────────────────────────

const StatusCell = ({
  status,
  onApprove,
  onReject,
}: {
  status: AttendanceExplanationStatus;
  onApprove: () => void;
  onReject: () => void;
}) => {
  if (
    status === AttendanceExplanationStatus.PENDING ||
    status === AttendanceExplanationStatus.PENDING_HR
  ) {
    return (
      <div className="flex items-center gap-1.5">
        <Button
          isIconOnly
          size="sm"
          variant="flat"
          color="danger"
          onPress={onReject}
          className="min-w-7 w-7 h-7"
        >
          <IconX size={14} strokeWidth={2.5} />
        </Button>
        <Button
          size="sm"
          color="primary"
          onPress={onApprove}
          className="px-3 h-8 text-sm font-medium"
        >
          Xác nhận
        </Button>
      </div>
    );
  }

  if (status === AttendanceExplanationStatus.APPROVED) {
    return (
      <Chip
        size="sm"
        variant="flat"
        color="success"
        startContent={<IconCheck size={13} />}
        classNames={{
          base: 'bg-emerald-100 border-0',
          content: 'text-emerald-700 font-medium px-1',
        }}
      >
        Đã xác nhận
      </Chip>
    );
  }

  if (status === AttendanceExplanationStatus.REJECTED) {
    return (
      <Chip
        size="sm"
        variant="flat"
        color="danger"
        startContent={<IconX size={13} />}
        classNames={{
          base: 'bg-pink-100 border-0',
          content: 'text-rose-600 font-medium px-1',
        }}
      >
        Từ chối
      </Chip>
    );
  }

  return null;
};

// ─── Main Component ───────────────────────────────────────────────────────────

export const AccountabilityTable = ({
  data,
  totalPages = 1,
  currentPage = 1,
  isLoading = false,
  selectedKeys,
  onSelectionChange,
  onPageChange,
  onApprove,
  onReject,
}: Props) => {
  const renderCell = useCallback(
    (row: AttendanceExplanation, columnKey: Key) => {
      switch (columnKey) {
        case 'departmentName':
          return (
            <span className="text-sm text-gray-700">{row.roomName || row.departmentName}</span>
          );

        case 'staffCode':
          return <span className="text-sm font-mono text-gray-700">{row.staffCode}</span>;

        case 'staffName':
          return <span className="text-sm font-medium text-gray-800">{row.staffName}</span>;

        case 'position':
          return <span className="text-sm text-gray-600">{row.position}</span>;

        case 'date':
          return (
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {row.dateLabel || row.date}
            </span>
          );

        case 'typeLabel':
          return <span className="text-sm text-gray-700 whitespace-nowrap">{row.typeLabel}</span>;

        case 'reason':
          return (
            <span className="text-sm text-gray-600">{row.totalWorkHours || row.reason || '—'}</span>
          );

        case 'attachment':
          return row.attachmentCount > 0 ? (
            <Link
              href={row.attachments?.[0]?.fileUrl ?? '#'}
              isExternal
              size="sm"
              className="flex items-center gap-1.5 text-blue-500"
            >
              <IconPaperclip size={13} />
              <span className="text-sm truncate max-w-[110px]">
                {row.firstAttachmentName || 'Tên file.pdf'}
              </span>
            </Link>
          ) : (
            <span className="text-gray-400">—</span>
          );

        case 'managerName':
          return (
            <span className="text-sm text-gray-700 whitespace-nowrap">
              {row.managerName || row.approvedByManagerName || '—'}
            </span>
          );

        case 'status':
          return (
            <StatusCell
              status={row.status}
              onApprove={() => onApprove?.(row.id)}
              onReject={() => onReject?.(row.id)}
            />
          );

        default:
          return null;
      }
    },
    [onApprove, onReject],
  );

  return (
    <Table
      aria-label="Bảng quản lý giải trình ca"
      selectionMode="multiple"
      //   selectedKeys={selectedKeys}
      //   onSelectionChange={onSelectionChange}
      bottomContent={
        totalPages > 1 ? (
          <div className="flex justify-start py-1">
            <Pagination
              page={currentPage}
              total={totalPages}
              onChange={onPageChange}
              showControls
              showShadow={false}
              size="sm"
              classNames={{
                cursor: 'bg-blue-500 text-white font-medium shadow-sm',
                item: 'text-gray-600',
              }}
            />
          </div>
        ) : null
      }
      classNames={{
        wrapper: 'shadow-none border border-gray-200 rounded-xl p-0',
        th: 'bg-gray-50 text-gray-500 text-xs font-semibold tracking-wide uppercase py-3 px-3 first:rounded-none last:rounded-none',
        td: 'py-3 px-3',
        tr: 'hover:bg-gray-50/60 transition-colors',
      }}
    >
      <TableHeader columns={COLUMNS}>
        {(col) => (
          <TableColumn key={col.key} style={{ minWidth: col.minWidth }}>
            {col.label}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody items={data} isLoading={isLoading} emptyContent="Không có dữ liệu giải trình">
        {(row) => (
          <TableRow key={row.id}>
            {(columnKey) => <TableCell>{renderCell(row, columnKey)}</TableCell>}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default AccountabilityTable;
