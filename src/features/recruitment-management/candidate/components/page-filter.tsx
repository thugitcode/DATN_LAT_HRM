import { NAMESPACES } from '@/i18n/constants';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { FilterSelect } from '@/components/filters/filter-select';
import { SearchInput } from '@/components/filters/search-input';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { icons } from '@/lib/icons';
import { CandidateStatusEnum, type CandidateFilters } from '../../recruitment-request-details/types/type';
import { CandidateSourceEnum } from '../../types/candidate.type';

export const PageFilter = ({ extraFilters }: { extraFilters?: React.ReactNode }) => {
    const { filters, setFilter } = useQueryFilter<CandidateFilters>();
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const handleSearchChange = useCallback(
        (value: string | undefined) => {
            setFilter('search', value);
        },
        [setFilter],
    );
    const statusOptions = Object.values(CandidateStatusEnum).map((status) => ({
        key: status,
        label: t(`candidate.status.${status.toLowerCase()}` as any)
    }));
    const sourceOptions = Object.values(CandidateSourceEnum).map((source) => ({
        key: source,
        label: t(`candidate.source.${source}`)
    }));
    const handleStatusChange = useCallback(
        (value: string | undefined) => {
            setFilter('status', value as CandidateStatusEnum);
        },
        [setFilter],
    );
    const handleSourceChange = useCallback(
        (value: string | undefined) => {
            setFilter('source', value as CandidateSourceEnum);
        },
        [setFilter],
    );

    return (
        <div className="flex items-center gap-3 justify-between">
            <SearchInput value={filters.search as string} onChange={handleSearchChange} startIcon={icons.search} />

            <FilterSelect
                options={statusOptions}
                value={filters.status as string}
                onChange={handleStatusChange}
                placeholder={t('form.placeholders.status')}
            />
            <FilterSelect
                options={sourceOptions}
                value={filters.source as string}
                onChange={handleSourceChange}
                placeholder={t('form.placeholders.source')}
            />

            {extraFilters}
        </div>
    );
};
