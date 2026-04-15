import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { FilterSelect } from '@/components/filters/filter-select';
import { SearchInput } from '@/components/filters/search-input';
import { icons } from '@/lib/icons';
import { useJobTitleOptions } from '@/hooks/select-options/use-job-title-options';
import { InterviewStatusEnum } from '../../recruitment-request-details/types/interview.type';
import { CandidateSourceEnum } from '../../types/candidate.type';

interface InterviewScheduleSearch {
  search?: string;
  jobTitleId?: string;
  status?: string;
  source?: string;
  [key: string]: unknown;
}

export function InterviewScheduleFilter() {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { filters, setFilter } = useQueryFilter<InterviewScheduleSearch>();
  const { options: jobTitleOptions } = useJobTitleOptions();

  const statusOptions = useMemo(
    () =>
      Object.values(InterviewStatusEnum).map((s) => ({
        key: s,
        label: t(`interview_schedule.status.${s}` as any),
      })),
    [t],
  );

  const sourceOptions = useMemo(
    () =>
      Object.values(CandidateSourceEnum).map((s) => ({
        key: s,
        label: t(`candidate.source.${s}` as any),
      })),
    [t],
  );

  return (
    <div className="flex gap-3 w-full">
      <SearchInput
        value={filters.search}
        onChange={(val) => setFilter('search', val || undefined)}
        placeholder={t('interview_schedule.filter.search_placeholder')}
        startIcon={icons.search}
      />

      <FilterSelect
        options={jobTitleOptions.map((opt) => ({ key: opt.value, label: opt.label }))}
        value={filters.jobTitleId}
        onChange={(val) => setFilter('jobTitleId', val)}
        placeholder={t('interview_schedule.filter.position_placeholder')}
      />

      <FilterSelect
        options={statusOptions}
        value={filters.status}
        onChange={(val) => setFilter('status', val)}
        placeholder={t('interview_schedule.filter.status_placeholder')}
      />

      <FilterSelect
        options={sourceOptions}
        value={filters.source}
        onChange={(val) => setFilter('source', val)}
        placeholder={t('interview_schedule.filter.source_placeholder')}
      />
    </div>
  );
}
