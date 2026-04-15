import { useTranslation } from 'react-i18next';
import { useSearch } from '@tanstack/react-router';

import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';
import { NAMESPACES } from '@/i18n/constants';
import { BtnCreate } from '@/components/btn-actions';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import type { InterviewScheduleFilters } from '../recruitment-request-details/types/interview.type';
import { InterviewCalendar } from './components/interview-calender';
import { InterviewScheduleFilter } from './components/interview-schedule-filter';

export const InterviewSchedule = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { onOpen } = useDrawer();
  const { candidateId } = useSearch({
    from: '/_private/admin/_dashboard/recruitment-management/interview-schedule',
  });
  const { filters } = useQueryFilter<InterviewScheduleFilters>();

  return (
    <PageContainer className="space-y-3">
      <div className="flex justify-between">
        <TitlePage className='text-3xl leading-9 font-semibold text-[#2C3782]' title={t('sidebar.interview_schedule')} />
        <BtnCreate onPress={() => onOpen(DrawerType.INTERVIEW_SCHEDULE_MUTATE)}>
          {t('button.set_schedule')}
        </BtnCreate>
      </div>
      <InterviewScheduleFilter />
      <div className='h-[calc(100vh-229px)]'>
        <InterviewCalendar candidateId={candidateId} filters={filters} heightCalendar='calc(100vh - 296px)' />
      </div>
    </PageContainer>
  );
};
