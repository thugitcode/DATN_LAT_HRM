import { Button, Input } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import type { ICandidate } from '@/features/recruitment-management/recruitment-request-details/types/type';
import { formatSalary } from '@/features/recruitment-management/constants/details';
import { icons } from '@/lib/icons';

interface ApplicationTabProps {
  candidate: ICandidate;
}

export function ApplicationTab({ candidate }: ApplicationTabProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const rr = candidate.recruitmentRequest;

  if (!rr) return <p className="text-sm text-[#71717A]">{t('candidate.detail.no_data')}</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {icons.case} <span className="font-medium text-lg leading-7">{t("form.fields.position")}</span>
      </div>
      <div className="flex items-start justify-between bg-[#F4F4F5] p-3 rounded-xl">
        <div>
          <h4 className="text-lg font-semibold text-[#11181C]">{rr.position}</h4>
          <span className="text-sm text-[#71717A]">{t(`form.options.work_type.${rr.workType}`)}</span>
        </div>
        <Button variant="bordered" color='primary' className="h-9 rounded-xl font-medium border-1" >
          {t('candidate.detail.view_jd')}
        </Button>
      </div>

      <div className="w-full border-t border-[#F4F4F5]" />

      <div className="grid grid-cols-3 gap-x-6 gap-y-4">
        <Input
          isReadOnly
          label={t('candidate.form.fields.department')}
          labelPlacement="outside"
          variant="underlined"
          value={rr.department?.name ?? '—'}
        />
        <Input
          isReadOnly
          label={t('candidate.form.fields.room')}
          labelPlacement="outside"
          variant="underlined"
          value={rr.room?.name ?? '—'}
        />
        <Input
          isReadOnly
          label={t('candidate.form.fields.work_type')}
          labelPlacement="outside"
          variant="underlined"
          value={rr.staffType ?? '—'}
        />
        <Input
          isReadOnly
          label={t('candidate.form.fields.experience_years')}
          labelPlacement="outside"
          variant="underlined"
          value={candidate.experienceYears ? t(`candidate.form.fields.experience_years_options.${candidate.experienceYears}`) : '—'}
        />
        <Input
          isReadOnly
          label={t('candidate.detail.salary')}
          labelPlacement="outside"
          variant="underlined"
          value={rr.salaryFrom && rr.salaryTo ? `${formatSalary(rr.salaryFrom)} – ${formatSalary(rr.salaryTo)}` : '—'}
        />
        <Input
          isReadOnly
          label={t('candidate.detail.expected_salary')}
          labelPlacement="outside"
          variant="underlined"
          value={
            candidate.expectedSalaryFrom && candidate.expectedSalaryTo
              ? `${formatSalary(candidate.expectedSalaryFrom)} – ${formatSalary(candidate.expectedSalaryTo)}`
              : '—'
          }
        />
      </div>
    </div>
  );
}
