import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';
import { InterviewCalendar } from './components/interview-calender';
import { BtnCreate } from '@/components/btn-actions';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { useSearch } from '@tanstack/react-router';

export const InterviewSchedule = () => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const { onOpen } = useDrawer();
  const { candidateId } = useSearch({
    from: '/_private/admin/_dashboard/recruitment-management/interview-schedule',
  });

  return (
    <PageContainer className="space-y-3">
      <div className="flex justify-between">
        <TitlePage className='text-3xl leading-9 font-semibold text-[#2C3782]' title={t('sidebar.interview_schedule')} />
        <BtnCreate onPress={() => onOpen(DrawerType.INTERVIEW_SCHEDULE_MUTATE)}>
          {t('button.set_schedule')}
        </BtnCreate>
      </div>
      <div className='h-[calc(100vh-164px)]'>
        <InterviewCalendar candidateId={candidateId} />
      </div>
    </PageContainer>
  );
};
