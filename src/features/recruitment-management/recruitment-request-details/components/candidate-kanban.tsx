import { Listbox, ListboxItem } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { CandidateStatusEnum, type Candidate } from '../types/type';
import { CandidateCard } from './candidate-card';

interface KanbanColumn {
  status: CandidateStatusEnum;
  labelKey: string;
  color: string;
  bgColor: string;
}

const COLUMNS: KanbanColumn[] = [
  { status: CandidateStatusEnum.APPLIED, labelKey: 'candidate.status.applied', color: 'text-[#006FEE]', bgColor: 'bg-[#EEF5FF]' },
  { status: CandidateStatusEnum.SCREENED, labelKey: 'candidate.status.screened', color: 'text-[#7828C8]', bgColor: 'bg-[#F3EFFE]' },
  { status: CandidateStatusEnum.WAITING_INTERVIEW, labelKey: 'candidate.status.waiting_interview', color: 'text-[#C4841D]', bgColor: 'bg-[#FEF3CD]' },
  { status: CandidateStatusEnum.INTERVIEWING, labelKey: 'candidate.status.interviewing', color: 'text-[#0E793C]', bgColor: 'bg-[#E8FAF0]' },
  { status: CandidateStatusEnum.WAITING_OFFER, labelKey: 'candidate.status.waiting_offer', color: 'text-[#0E793C]', bgColor: 'bg-[#E8FAF0]' },
  { status: CandidateStatusEnum.PROBATION_PROPOSED, labelKey: 'candidate.status.probation_proposed', color: 'text-[#006FEE]', bgColor: 'bg-[#EEF5FF]' },
  { status: CandidateStatusEnum.ON_PROBATION, labelKey: 'candidate.status.on_probation', color: 'text-[#11181C]', bgColor: 'bg-[#F4F4F5]' },
  { status: CandidateStatusEnum.REJECTED, labelKey: 'candidate.status.rejected', color: 'text-[#F31260]', bgColor: 'bg-[#FEE7EF]' },
  { status: CandidateStatusEnum.OFFER_DECLINED, labelKey: 'candidate.status.offer_declined', color: 'text-[#F31260]', bgColor: 'bg-[#FEE7EF]' },
];

interface CandidateKanbanProps {
  candidates: Candidate[];
}

export const CandidateKanban = ({ candidates }: CandidateKanbanProps) => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const grouped = candidates.reduce<Record<string, Candidate[]>>((acc, c) => {
    if (!acc[c.status]) acc[c.status] = [];
    acc?.[c?.status]?.push(c);
    return acc;
  }, {});

  const activeColumns = COLUMNS.filter((col) => (grouped[col.status]?.length ?? 0) > 0);

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-full">
      {activeColumns.map((col) => {
        const items = grouped[col.status] ?? [];
        return (
          <div key={col.status} className="flex-shrink-0 bg-white rounded-xl p-3 w-[245.5px] flex flex-col gap-2 h-fit">
            <div className="flex items-center gap-2 px-3 py-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${col.bgColor} ${col.color}`}>
                {t(col.labelKey as any)}
              </span>
              <span className="text-xs font-medium text-[#71717A]">{items.length}</span>
            </div>
            <Listbox
              aria-label={t(col.labelKey as any)}
              items={items}
              isVirtualized
              virtualization={{
                maxListboxHeight: 720,
                itemHeight: 200,
              }}
              classNames={{
                base: 'flex-1 overflow-hidden p-0',
                list: 'flex gap-3 p-1 pr-2 scrollbar-thin',
              }}
              itemClasses={{
                base: 'p-0 rounded-lg data-[hover=true]:bg-transparent data-[selectable=true]:focus:bg-transparent',
              }}
            >
              {(candidate) => (
                <ListboxItem key={candidate.id} textValue={candidate.name} className="p-0">
                  <CandidateCard candidate={candidate} />
                </ListboxItem>
              )}
            </Listbox>
          </div>
        );
      })}
    </div>
  );
};
