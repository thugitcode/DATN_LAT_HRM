import { useMemo } from 'react';
import dayjs from 'dayjs';

import type { ShiftManagementParams } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import { useMonthDateRange } from '@/hooks/use-month-date-range';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionsPage } from '@/components/actions-page';
import { TitlePage } from '@/components/title-page';

import { LayoutRenderer } from '../components/layout-renderer';
import { WrapperToolBar } from '../components/wrapper-toolbar';
import { useCurrentLayout } from '../hooks/use-current-layout';
import { TimekeepingManagementLegend } from '../timekeeping-management/components/timekeeping-management-legend';
import { BtnCreateShift } from './components/btn-create-shift';
import { ShiftManagementGrid } from './components/grid-layout/shift-management-grid';
import { ShiftManagementFilter } from './components/shift-management-filter';
import { ShiftManagementListview } from './components/shift-management-listview';
import { SHIFT_CA_LEGEND } from './constants/data';
import { downloadShiftTemplate } from './constants/shift-template';
import { useShiftExport } from './hooks/use-shift-export';
import { useShiftManagementList } from './hooks/use-shift-management';

export const ShiftManagement = () => {
  const currentLayout = useCurrentLayout();

  const { filters } = useQueryFilter<ShiftManagementParams>();

  const { startDate, endDate } = useMonthDateRange(filters.month);

  const { data, isLoading } = useShiftManagementList({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    startDate,
    endDate,
    search: filters.search,
    departmentId: filters.departmentId,
    roomId: filters.roomId,
    getAll: currentLayout === LayoutSwitcherEnum.GRID,
  });

  const { exportConfig } = useShiftExport(data?.data);

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-3">
        <WrapperToolBar className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <TitlePage title="Quản lý phân ca" />

            <ActionsPage
              actions={<BtnCreateShift />}
              // exportConfig={exportConfig}
              // importConfig={importConfig}
              // exportConfig={exportConfig}
              // onExportTemplate={() => downloadShiftTemplate()}
            />
          </div>
          <ShiftManagementFilter />
        </WrapperToolBar>

        <LayoutRenderer
          layouts={{
            [LayoutSwitcherEnum.LIST]: {
              component: ShiftManagementListview,
              props: {
                data: data?.data,
                total: data?.pagination?.total,
                page: filters.page,
                isLoading,
                pageSize: filters.limit,
                totalPage: data?.pagination?.totalPage,
                search: filters.search,
              },
            },
            [LayoutSwitcherEnum.GRID]: {
              component: ShiftManagementGrid,
              props: { data: data?.data, isLoading },
            },
          }}
        />
      </div>

      <TimekeepingManagementLegend legendItems={SHIFT_CA_LEGEND} />
    </div>
  );
};
