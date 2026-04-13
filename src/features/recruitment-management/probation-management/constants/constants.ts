import { ProbationStatusEnum } from '../types/probation.type';

export const PROBATION_STATUS_CONFIG: Record<
  ProbationStatusEnum,
  { labelKey: string; color: string; bg: string }
> = {
  [ProbationStatusEnum.WAITING_FOR_ACCEPTANCE]: {
    labelKey: 'probation.status.waiting_for_acceptance',
    color: 'text-[#71717A]',
    bg: 'bg-[#F4F4F5]',
  },
  [ProbationStatusEnum.IN_PROGRESS]: {
    labelKey: 'probation.status.in_progress',
    color: 'text-[#006FEE]',
    bg: 'bg-[#EEF5FF]',
  },
  [ProbationStatusEnum.WAITING_FOR_EVALUATION]: {
    labelKey: 'probation.status.waiting_for_evaluation',
    color: 'text-[#C4841D]',
    bg: 'bg-[#FEF3CD]',
  },
  [ProbationStatusEnum.PASS]: {
    labelKey: 'probation.status.pass',
    color: 'text-[#0E793C]',
    bg: 'bg-[#E8FAF0]',
  },
  [ProbationStatusEnum.EXTENDED]: {
    labelKey: 'probation.status.extended',
    color: 'text-[#7828C8]',
    bg: 'bg-[#F4EEFF]',
  },
  [ProbationStatusEnum.FAIL]: {
    labelKey: 'probation.status.fail',
    color: 'text-[#F31260]',
    bg: 'bg-[#FEE7EF]',
  },
  [ProbationStatusEnum.OFFICIALLY_ACCEPTED]: {
    labelKey: 'probation.status.officially_accepted',
    color: 'text-[#0891B2]',
    bg: 'bg-[#ECFEFF]',
  },
};
