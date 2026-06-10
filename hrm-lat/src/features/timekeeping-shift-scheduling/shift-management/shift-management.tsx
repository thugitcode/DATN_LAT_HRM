'use client';

import { useMemo, useRef, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { ShiftManagementPrint } from '@/templates/prints/shift-management/shift-management-print';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';

import type { ShiftManagementParams } from '@/types';
import { LayoutSwitcherEnum } from '@/types/global.type';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
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
import { ShiftImportReviewModal } from './components/shift-import-review-modal';
import { ShiftManagementFilter } from './components/shift-management-filter';
import { ShiftManagementListview } from './components/shift-management-listview';
import { getShiftCaLegend } from './constants/data';
import { useShiftExport } from './hooks/use-shift-export';
import type { ParseShiftResult } from './hooks/use-shift-import';
import { useShiftImport } from './hooks/use-shift-import';
import { useShiftManagementList } from './hooks/use-shift-management';

export const ShiftManagement = () => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const currentLayout = useCurrentLayout();
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { startDate, endDate } = useMonthDateRange(filters.month);
  const { options: departmentOptions } = useDepartmentOptions();

  const { data, isLoading } = useShiftManagementList({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    startDate,
    endDate,
    search: filters.search,
    departmentId: filters.departmentId,
    roomId: filters.roomId,
    getAll: currentLayout === LayoutSwitcherEnum.GRID ? true : undefined,
  });

  const departmentName = useMemo(() => {
    if (!filters?.departmentId) return '';
    const dept = departmentOptions.find((d) => d.key === filters.departmentId);
    return dept?.label ?? '';
  }, [departmentOptions, filters.departmentId]);

  const { onExport, onExportTemplate } = useShiftExport(data?.data ?? [], departmentName);
  const handlePrint = useReactToPrint({ contentRef: printRef });

  const [parsedImport, setParsedImport] = useState<ParseShiftResult | null>(null);

  const { handleFile } = useShiftImport({
    onParsed: (result) => setParsedImport(result),
    onError: (err) => console.error(err),
  });

  const shiftCaLegend = getShiftCaLegend(t);

  return (
    <>
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-3">
          <WrapperToolBar className="space-y-4 flex flex-col">
            <div className="flex items-center justify-between">
              <TitlePage title={t('shift_management.title')} />
              <ActionsPage
                actions={<BtnCreateShift />}
                onExport={onExport}
                onExportTemplate={onExportTemplate}
                onPrint={handlePrint}
                onImport={() => fileInputRef.current?.click()}
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
        <TimekeepingManagementLegend legendItems={shiftCaLegend} />
        <div style={{ display: 'none' }}>
          <ShiftManagementPrint
            ref={printRef}
            data={data?.data ?? []}
            monthQuery={filters.month}
            layout={currentLayout}
            departmentName={departmentName}
          />
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={handleFile}
      />

      <ShiftImportReviewModal
        isOpen={!!parsedImport}
        parsed={parsedImport}
        onClose={() => setParsedImport(null)}
      />
    </>
  );
};
