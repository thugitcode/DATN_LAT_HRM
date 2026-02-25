import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '@tanstack/react-router';
import { useShiftManagementQuery } from '@/query-options/shift-management';
import { useLayoutStore } from '@/store/useLayoutStore';
import dayjs from 'dayjs';

import { LayoutSwitcherEnum } from '@/types/global.type';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { ActionsPage } from '@/components/actions-page';
import { FooterPageColor } from '@/components/footer-page-color';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';
import { WrapperLoading } from '@/components/wrapper-loading';

import { ShiftManagementFilter } from './components/shift-management-filter';
import { ShiftManagementGrid } from './components/shift-management-grid';
import { ShiftManagementListview } from './components/shift-management-listview';

export const ShiftManagement = () => {
  const location = useLocation();
  const pathname = location.pathname || '/';
  const currentLayout = useLayoutStore((state) => state.getLayout(pathname));

  const { filters } = useQueryFilter();

  const { startDate, endDate } = useMemo(() => {
    const monthStr =
      typeof filters.month === 'string' && filters.month
        ? filters.month
        : dayjs().format('YYYY-MM');

    const monthDate = dayjs(monthStr, 'YYYY-MM');

    return {
      startDate: monthDate.startOf('month').format('YYYY-MM-DD'),
      endDate: monthDate.endOf('month').format('YYYY-MM-DD'),
    };
  }, [filters.month]);

  const [page, setPage] = useState(1);

  const { data, isLoading, error, refetch, isFetching } = useQuery(
    useShiftManagementQuery({
      page,
      limit: 10,
      startDate,
      endDate,
    }),
  );

  return (
    // <WrapperLoading loading={isLoading}>
    <div className="flex flex-col justify-baseline h-full gap-5">
      <PageContainer className="flex flex-col justify-between overflow-hidden">
        <div className="space-y-4 flex flex-col size-full">
          <div className="flex items-center justify-between">
            <TitlePage title="Quản lý phân ca" />

            <ActionsPage />
          </div>

          <ShiftManagementFilter />

          <div className="flex-1 overflow-hidden h-full">
            {currentLayout === LayoutSwitcherEnum.LIST ? (
              <ShiftManagementListview data={data?.schedules} total={data?.pagination?.total} />
            ) : (
              <ShiftManagementGrid data={data?.schedules} />
            )}
          </div>
        </div>
      </PageContainer>
      <FooterPageColor />
    </div>
    // </WrapperLoading>
  );
};
