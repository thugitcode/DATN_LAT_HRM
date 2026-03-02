import { caseCategoryService } from '@/services/case-category.service';

import type { CaseCategory } from '@/types/case-category.type';
import type { StaffParams } from '@/types/staff.type';

import { createCrudHooks } from '../use-crud-query';

export const useCaseCategoryOptions = () => {
  const { useList: useCaseCategoryList } = createCrudHooks<CaseCategory, StaffParams>(
    ['case-category'],
    caseCategoryService,
  );

  const { data } = useCaseCategoryList({
    page: 1,
    limit: 100,
  });

  return {
    options:
      data?.data?.map((item) => ({
        key: item.id,
        label: item.name,
        startTime: item.startTime,
        endTime: item.endTime,
        type: item.type,
      })) ?? [],
  };
};
