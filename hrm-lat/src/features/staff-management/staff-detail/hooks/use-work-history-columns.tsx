import { useMemo, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import type { ColumnDef } from '@/components/data-table/data-table';
import { ActionButton } from '@/components/action-button';
import { icons } from '@/lib/icons';
import { useConfirmStore } from '@/store/useConfirmStore';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { ContractStatusEnum, ContractTypeEnum, StaffPositionEnum, WorkingTypeEnum } from '@/types/staff.type';
import {
  useApproveContract,
  useDeleteContract,
  useSignContract,
} from '@/query-options/staff-contract';
import { addToast } from '@heroui/react';
import { DepartmentRoomInfo } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info';
import type { Department } from '@/types/deparment.type';
import type { Room } from '@/types/room.type';
import { IconX, IconEye } from '@tabler/icons-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface WorkHistoryRow {
  id: string;
  _contractId: string;
  _staffCode?: string;
  _staffName?: string;
  _departmentName?: string;
  departments?: { id: string; name: string }[];
  rooms?: { id: string; name: string }[];
  jobTitle: { id: string; name: string };
  position: StaffPositionEnum;
  contractType: ContractTypeEnum;
  workType: WorkingTypeEnum;
  duration: number;
  durationUnit: string;
  startDate: string;
  endDate: string;
  contractStatus: ContractStatusEnum;
  createdAt?: string;
  updatedAt?: string;
}

// ── Translate maps ────────────────────────────────────────────────────────────

// ── Status chip ───────────────────────────────────────────────────────────────

const STATUS_CLASS: Record<string, string> = {
  PENDING_APPROVAL: 'bg-[#FFF7ED] text-[#EA580C]',
  PENDING_SIGNATURE: 'bg-[#F0F1FF] text-[#6576FF]',
  SIGNED: 'bg-[#F0FDF4] text-[#16A34A]',
  EXPIRED: 'bg-[#FEF2F2] text-[#DC2626]',
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useWorkHistoryColumns = (staffId: string) => {
  const { t, i18n } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  const onOpenDrawer = useDrawer((state) => state.onOpen);
  const openConfirm = useConfirmStore((state) => state.open);

  const [viewContractId, setViewContractId] = useState<string | null>(null);
  const approveMutation = useApproveContract(staffId);
  const signMutation = useSignContract(staffId);
  const deleteMutation = useDeleteContract(staffId);

  const handleApprove = (contractId: string) => {
    openConfirm(
      {
        title: t('work_history.actions.approve_title'),
        description: t('work_history.actions.approve_desc'),
        confirmLabel: t('work_history.actions.approve'),
        confirmColor: 'primary',
      },
      async () => {
        await approveMutation.mutateAsync(contractId, {
          onSuccess: () => addToast({ title: t('work_history.actions.approve_success'), color: 'success' }),
          onError: (error: Error) =>
            addToast({ title: t('work_history.actions.approve_error'), description: error.message, color: 'danger' }),
        });
      },
    );
  };

  const handleSign = (contractId: string) => {
    openConfirm(
      {
        title: t('work_history.actions.sign_title'),
        description: t('work_history.actions.sign_desc'),
        confirmLabel: t('work_history.actions.sign'),
        confirmColor: 'primary',
      },
      async () => {
        await signMutation.mutateAsync(contractId, {
          onSuccess: () => addToast({ title: t('work_history.actions.sign_success'), color: 'success' }),
          onError: (error: Error) =>
            addToast({ title: t('work_history.actions.sign_error'), description: error.message, color: 'danger' }),
        });
      },
    );
  };

  const handleDelete = (contractId: string) => {
    openConfirm(
      {
        title: t('work_history.actions.delete_title'),
        description: t('work_history.actions.delete_desc'),
        confirmLabel: t('work_history.actions.delete_title'),
        confirmColor: 'danger',
      },
      async () => {
        await deleteMutation.mutateAsync(contractId, {
          onSuccess: () => addToast({ title: t('work_history.actions.delete_success'), color: 'success' }),
          onError: (error: Error) =>
            addToast({ title: t('work_history.actions.delete_error'), description: error.message, color: 'danger' }),
        });
      },
    );
  };

  const columns: ColumnDef<WorkHistoryRow>[] = useMemo(
    () => [
      {
        key: 'staffCode',
        title: t('work_history.columns.staff_code'),
        minWidth: 120,
        render: (_, row) => <span className="whitespace-nowrap">#{row._staffCode || '—'}</span>,
      },
      {
        key: 'staffName',
        title: t('work_history.columns.staff_name'),
        minWidth: 140,
        render: (_, row) => <span className="whitespace-nowrap">{row._staffName || '—'}</span>,
      },
      {
        key: 'jobTitle',
        title: t('work_history.columns.job_title'),
        minWidth: 120,
        render: (_, row) => (
          <span className="whitespace-nowrap">{row.jobTitle?.name || '—'}</span>
        ),
      },
      {
        key: 'position',
        title: t('work_history.columns.position'),
        minWidth: 110,
        render: (_, row) => (
          <span className="whitespace-nowrap">{tc(`options.staff_position.${row.position}`) || '—'}</span>
        ),
      },
      {
        key: 'department',
        title: t('work_history.columns.department'),
        minWidth: 120,
        render: (_, row) =>
          <DepartmentRoomInfo departments={row.departments} rooms={row.rooms} />
      },
      {
        key: 'contractType',
        title: t('work_history.columns.contract_type'),
        minWidth: 160,
        render: (_, row) => (
          <span className="whitespace-nowrap">
            {tc(`options.contractType.${row.contractType}`) || '—'}
          </span>
        ),
      },
      {
        key: 'workType',
        title: t('work_history.columns.work_type'),
        minWidth: 100,
        render: (_, row) => (
          <span className="whitespace-nowrap">{t(`options.workType.${row.workType}`) || '—'}</span>
        ),
      },
      {
        key: 'duration',
        title: t('work_history.columns.duration'),
        minWidth: 100,
        render: (_, row) => (
          <span className="whitespace-nowrap">
            {row.durationUnit === 'YEAR'
              ? t('work_history.duration_year', { duration: row.duration })
              : t('work_history.duration_month', { duration: row.duration })}
          </span>
        ),
      },
      {
        key: 'startDate',
        title: t('work_history.columns.start_date'),
        minWidth: 110,
        render: (_, row) => (
          <span className="whitespace-nowrap">{dayjs(row.startDate).format('DD/MM/YYYY')}</span>
        ),
      },
      {
        key: 'endDate',
        title: t('work_history.columns.end_date'),
        minWidth: 110,
        render: (_, row) => (
          <span className="whitespace-nowrap">{dayjs(row.endDate).format('DD/MM/YYYY')}</span>
        ),
      },
      {
        key: 'status',
        title: t('work_history.columns.status'),
        minWidth: 120,
        render: (_, row) => {
          const status = row.contractStatus as unknown as string;
          return (
            <Chip
              size="sm"
              variant="flat"
              className={`border-none font-medium text-xs px-2 ${STATUS_CLASS[status] ?? ''}`}
            >
              {t(`work_history.status.${status}` as any)}
            </Chip>
          );
        },
      },
      {
        key: 'actions',
        title: '',
        minWidth: 160,
        align: 'end',
        sticky: 'right',
        render: (_, row) => {
          const status = row.contractStatus as unknown as string;
          const canEdit = status === 'PENDING_APPROVAL' || status === 'PENDING_SIGNATURE';

          return (
            <div className="flex items-center justify-end gap-2">
              {status === 'PENDING_APPROVAL' && (
                <>
                  {/* <Button isIconOnly ><IconX color='red' /></Button> */}
                  <Button
                    color="primary"
                    className="min-w-[135px] px-4"
                    isLoading={approveMutation.isPending}
                    onPress={() => handleApprove(row._contractId)}
                  >
                    {t('work_history.actions.approve')}
                  </Button>
                </>
              )}
              {status === 'PENDING_SIGNATURE' && (
                <Button
                  className="bg-[#020617] min-w-[135px] text-white px-4"
                  isLoading={signMutation.isPending}
                  onPress={() => handleSign(row._contractId)}
                >
                  {t('work_history.actions.sign')}
                </Button>
              )}
              {canEdit && (
                <Button
                  isIconOnly
                  variant="ghost"
                  className='border-none'
                  onPress={() =>
                    onOpenDrawer(DrawerType.STAFF_CONTRACT_MUTATE, {
                      staffId,
                      contractId: row._contractId,
                    })
                  }
                >
                  {icons.pen}
                </Button>
              )}
              {canEdit && (
                <Button
                  isIconOnly
                  variant="ghost"
                  className='border-none'
                  onPress={() => handleDelete(row._contractId)}
                >
                  {icons.bin}
                </Button>
              )}
              {/* 👁️ Xem chi tiết - hiện cho mọi status */}
              <Button
                isIconOnly
                variant="light"
                size="sm"
                title="Xem chi tiết hợp đồng"
                onPress={() => setViewContractId(row._contractId)}
              >
                <IconEye size={16} className="text-[#6576FF]" />
              </Button>
            </div>
          );
        },
      },
    ],
    [t, tc, i18n.language, staffId, approveMutation.isPending, signMutation.isPending],
  );

  return { columns, viewContractId, setViewContractId };
};