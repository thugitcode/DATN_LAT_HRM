import { useCallback } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { exportBusinessTripExcel } from '@/templates/excels/other-requests-management/export-business-trip-excel';
import { useTranslation } from 'react-i18next';

import { useQueryFilter } from '@/hooks/useQueryFilter';

import type { BusinessTrip } from '../types/business-trip.type';
import type { OtherRequestsManagementParams } from '../types/type';

interface UseBusinessTripExportOptions {
  data: BusinessTrip[];
  companyName: string;
  unitName: string;
  departmentName?: string;
}

export const useBusinessTripExport = ({
  data,
  companyName,
  unitName,
  departmentName,
}: UseBusinessTripExportOptions) => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);
  const { filters } = useQueryFilter<OtherRequestsManagementParams>();

  const handleExport = useCallback(() => {
    exportBusinessTripExcel({
      data,
      month: filters.month,
      companyName,
      unitName,
      departmentName,
      t,
    });
  }, [data, filters.month, companyName, unitName, departmentName, t]);

  return { handleExport };
};
