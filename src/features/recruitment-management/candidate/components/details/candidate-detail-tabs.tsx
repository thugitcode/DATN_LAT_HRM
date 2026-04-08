import { Tab, Tabs } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import type { ICandidate } from '@/features/recruitment-management/recruitment-request-details/types/type';
import { DetailTabEnum } from '@/features/recruitment-management/constants/details';

import { ApplicationTab } from './tabs/application-tab';
import { AttachmentsTab } from './tabs/attachments-tab';
import { EvaluationTab } from './tabs/evaluation-tab';
import { HistoryTab } from './tabs/history-tab';
import { OfferTab } from './tabs/offer-tab';

interface CandidateDetailTabsProps {
  candidate: ICandidate;
  activeTab: DetailTabEnum;
  onTabChange: (tab: DetailTabEnum) => void;
}

export function CandidateDetailTabs({ candidate, activeTab, onTabChange }: CandidateDetailTabsProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT) as any;

  return (
    <div className="bg-white rounded-2xl overflow-hidden">
      <div className="border-b border-[#F4F4F5] px-5">
        <Tabs
          aria-label="candidate-detail-tabs"
          variant="underlined"
          color="primary"
          selectedKey={activeTab}
          onSelectionChange={(k) => onTabChange(k as DetailTabEnum)}
          classNames={{
            base: 'bg-transparent',
            tabList: 'p-0 gap-6',
            tab: 'h-10 px-0 text-sm',
            cursor: 'shadow-none',
          }}
        >
          <Tab key={DetailTabEnum.APPLICATION} title={t('candidate.detail.tabs.application')} />
          <Tab key={DetailTabEnum.ATTACHMENTS} title={t('candidate.detail.tabs.attachments')} />
          <Tab key={DetailTabEnum.INTERVIEW_HISTORY} title={t('candidate.detail.tabs.interview_history')} />
          <Tab key={DetailTabEnum.EVALUATION} title={t('candidate.detail.tabs.evaluation')} />
          <Tab key={DetailTabEnum.OFFER} title={t('candidate.detail.tabs.offer')} />
        </Tabs>
      </div>

      <div className="overflow-auto h-[calc(100vh-172px)]">
        {activeTab === DetailTabEnum.APPLICATION &&
          <div className='p-5'>
            <ApplicationTab candidate={candidate} />
          </div>}
        {activeTab === DetailTabEnum.ATTACHMENTS &&
          <div className='p-5'>
            <AttachmentsTab candidate={candidate} />
          </div>}
        {activeTab === DetailTabEnum.INTERVIEW_HISTORY &&
          <div className='p-5'>
            <HistoryTab candidate={candidate} />
          </div>}
        {activeTab === DetailTabEnum.EVALUATION &&
          <div className='p-5'>
            <EvaluationTab candidate={candidate} />
          </div>}
        {activeTab === DetailTabEnum.OFFER &&
          <OfferTab candidate={candidate} />
        }
      </div>
    </div>
  );
}
