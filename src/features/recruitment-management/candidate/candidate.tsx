import { PageContainer } from '@/components/page-container';
import { LayoutRenderer } from '@/features/timekeeping-shift-scheduling/components/layout-renderer';
import { LayoutSwitcherEnum } from '@/types/global.type';

import { ActionsPage } from '@/components/actions-page';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { DEFAULT_LIMIT, DEFAULT_PAGE } from '@/lib/constants';
import { CandidateKanban } from '../recruitment-request-details/components/candidate-kanban';
import { useCandidateList } from '@/hooks/queries/use-candidate-query';
import { CandidateList } from './components/candidate-list';
import { PageFilter } from './components/page-filter';
import type {
  CandidateFilters,
  CandidateStatusEnum,
} from '../recruitment-request-details/types/type';
import type { CandidateSourceEnum } from '../types/candidate.type';
import { Button } from '@heroui/react';
import { icons } from '@/lib/icons';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';

export const Candidate = () => {
  const { filters } = useQueryFilter<CandidateFilters>()
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const page = Number(filters.page) || DEFAULT_PAGE;
  const limit = Number(filters.limit) || 10;
  const search = (filters.search as string) || '';
  const status = filters.status as CandidateStatusEnum | undefined;
  const source = filters.source as CandidateSourceEnum | undefined;

  const { data } = useCandidateList({ page, limit, search, status, source });
  const candidates = data?.data ?? [];
  const pagination = data?.pagination;
  const { onOpen } = useDrawer()
  return (
    <PageContainer className="space-y-3">
      <div className="flex flex-col gap-3 h-full">
        <div className="flex justify-end">
          <ActionsPage
            actions={
              <Button color='primary' onPress={() => onOpen(DrawerType.CANDIDATE_MUTATE)}>
                {icons.plus} {t('candidate.actions.add_candidate')}
              </Button>
            }
          />
        </div>
        <PageFilter />
        <LayoutRenderer
          wrapperClassName='p-0!'
          layouts={{
            [LayoutSwitcherEnum.LIST]: {
              component: CandidateList,
              props: {
                candidates,
                pagination: pagination
                  ? {
                    current: page,
                    pageSize: limit,
                    total: pagination.total,
                    totalPage: pagination.totalPage,
                  }
                  : false,
              },
            },
            [LayoutSwitcherEnum.GRID]: {
              component: CandidateKanban,
              props: { candidates },
            },
          }}
        />
      </div>
    </PageContainer>
  );
};
