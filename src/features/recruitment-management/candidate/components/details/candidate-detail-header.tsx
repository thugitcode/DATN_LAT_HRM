import { Button } from '@heroui/react';
import { IconArrowLeft, IconMail } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from '@tanstack/react-router';

import { NAMESPACES } from '@/i18n/constants';
import { formatDate } from '@/lib/utils';
import type { ICandidate } from '@/features/recruitment-management/recruitment-request-details/types/type';

import { formatSalary } from '@/features/recruitment-management/constants/details';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { CandidateStatusSelect } from './candidate-status-select';

interface CandidateDetailHeaderProps {
  candidate: ICandidate;
}

export function CandidateDetailHeader({ candidate }: CandidateDetailHeaderProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT) as any;
  const navigate = useNavigate();
  const { onOpen } = useDrawer()
  const rr = candidate.recruitmentRequest;

  return (
    <div className="bg-transparent px-6 py-4 shrink-0">
      <div className="flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-4">
          <Button className="rounded-full bg-white" isIconOnly onPress={() => navigate({ to: '/admin/recruitment-management/candidate' })}>
            <IconArrowLeft color="#52525B" />
          </Button>

          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {candidate.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#11181C] text-base">{candidate.name}</span>
              <CandidateStatusSelect candidateId={candidate.id} status={candidate.status} />
            </div>
            <p className="text-sm text-[#71717A]">
              {rr?.position ?? '—'} · {rr?.department?.name ?? '—'}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="text-sm text-[#71717A]">
            {t('candidate.detail.applied_date')}:{' '}
            <span className="text-[#11181C] font-medium">{formatDate(candidate.createdAt)}</span>
          </div>
          {(candidate.expectedSalaryFrom || candidate.expectedSalaryTo) && (
            <div className="text-sm text-[#71717A]">
              {t('candidate.detail.expected_salary')}:{' '}
              <span className="text-primary font-semibold">
                {formatSalary(candidate.expectedSalaryFrom)}–{formatSalary(candidate.expectedSalaryTo)}/tháng
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Button color="primary" size="sm" className="rounded-xl font-medium" onPress={() => onOpen(DrawerType.OFFER_MUTATE, {
              candidateId: candidate.id,
              candidateName: candidate.name,
              candidatePosition: candidate.recruitmentRequest?.position,
              candidateDepartment: candidate.recruitmentRequest?.department?.name,
              candidateStatus: candidate.status,
            })}>
              Offer
            </Button>
            <Button variant="bordered" size="sm" className="rounded-xl font-medium">
              {t('candidate.detail.schedule_interview')}
            </Button>
            <Button
              variant="bordered"
              size="sm"
              className="rounded-xl font-medium"
              startContent={<IconMail size={16} />}
            >
              {t('candidate.detail.send_email')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
