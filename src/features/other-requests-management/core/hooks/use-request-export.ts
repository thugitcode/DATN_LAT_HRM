import { useCallback } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type { ExportConfig, Translator } from '../types/request-management.types';

export const useRequestExport = ({
  data,
  month,
  companyName,
  unitName,
  departmentName,
  exportFn,
}: ExportConfig) => {
  const { t } = useTranslation(NAMESPACES.OTHER_REQUESTS_MANGAGEMENT);

  const handleExport = useCallback(() => {
    exportFn({ data, month, companyName, unitName, departmentName, t: t as unknown as Translator });
  }, [data, month, companyName, unitName, departmentName, exportFn, t]);

  return { handleExport };
};
