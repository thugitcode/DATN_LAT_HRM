import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useStaffList } from '@/query-options/staff';
import { useTranslation } from 'react-i18next';

import { ContractTypeEnum, type Staff } from '@/types/staff.type';
import { PAGE_SIZE_OPTIONS } from '@/lib/utils';

import { useOfficialEmployeeColumns } from '../core/columns/use-official-employee-columns';
import { StaffManagementGrid } from '../core/components/staff-management-grid';
import { StaffManagementList } from '../core/components/staff-management-list';
import { StaffManagementPage } from '../core/components/staff-management-page';
import { useStaffManagementPage } from '../core/hooks/use-staff-management-page';

export const OfficialEmployee = () => {
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);

  const { columns } = useOfficialEmployeeColumns();

  const { search, status, page, limit, departmentId, jobTitle, positions, roomId, handlePrint } =
    useStaffManagementPage();

  const { data: response, isLoading } = useStaffList({
    page,
    limit,
    search: search,
    status: status,
    jobTitle: jobTitle,
    positions: positions,
    departmentIds: departmentId ? [departmentId] : undefined,
    roomIds: roomId ? [roomId] : undefined,
    contractType: ContractTypeEnum.FULL_TIME,
  });

  const staffData = response?.data || [];
  const total = response?.pagination?.total || 0;
  const totalPage = response?.pagination?.totalPage || 0;
  const workingCount = (response?.metadata?.WORKING as number) || 0;
  const resignedCount = (response?.metadata?.RESIGNED as number) || 0;

  const paginationConfig = useMemo(
    () => ({
      current: Number(page),
      showSizeChanger: true,
      pageSizeOptions: PAGE_SIZE_OPTIONS,
      total: total,
      pageSize: Number(limit),
      totalPage: totalPage,
    }),
    [page, total, limit, totalPage],
  );

  return (
    <StaffManagementPage
      title={t('staff_types.official')}
      onExport={() => {}}
      onPrint={handlePrint}
      workingCount={workingCount}
      resignedCount={resignedCount}
      listLayout={
        <StaffManagementList
          data={staffData}
          columns={columns}
          isLoading={isLoading}
          pagination={paginationConfig}
        />
      }
      gribLayout={
        <StaffManagementGrid
          data={staffData}
          columns={columns}
          isLoading={isLoading}
          pagination={paginationConfig}
        />
      }
      printContent={<div>Print content</div>}
    />
  );
};
