import { useMemo } from 'react';
import dayjs from 'dayjs';

import type { ShiftManagementParams } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionsPage } from '@/components/actions-page';
import { TitlePage } from '@/components/title-page';

import { LayoutRenderer } from '../components/layout-renderer';
import { WrapperToolBar } from '../components/wrapper-toolbar';
import { TimekeepingManagementLegend } from '../timekeeping-management/components/timekeeping-management-legend';
import { BtnCreateShift } from './components/btn-create-shift';
import { ShiftManagementGrid } from './components/grid-layout/shift-management-grid';
import { ShiftManagementFilter } from './components/shift-management-filter';
import { ShiftManagementListview } from './components/shift-management-listview';
import { SHIFT_CA_LEGEND } from './constants/data';
import { useShiftManagementList } from './hooks/use-shift-management';

export const ShiftManagement = () => {
  const { filters } = useQueryFilter<ShiftManagementParams>();

  const { startDate, endDate } = useMemo(() => {
    const monthStr = filters.month ?? dayjs().format('YYYY-MM');
    const monthDate = dayjs(monthStr, 'YYYY-MM');

    return {
      startDate: monthDate.startOf('month').format('YYYY-MM-DD'),
      endDate: monthDate.endOf('month').format('YYYY-MM-DD'),
    };
  }, [filters.month]);

  const { data, isLoading } = useShiftManagementList({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    startDate,
    endDate,
    search: filters.search,
  });

  return (
    <div className="flex flex-col justify-baseline h-full">
      <div className="space-y-3">
        <WrapperToolBar className="space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <TitlePage title="Quản lý phân ca" />
            <ActionsPage actions={<BtnCreateShift />} />
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
              },
            },
            [LayoutSwitcherEnum.GRID]: {
              component: ShiftManagementGrid,
              props: { data: data?.data },
            },
          }}
        />
      </div>

      <TimekeepingManagementLegend legendItems={SHIFT_CA_LEGEND} />
    </div>
  );
};
