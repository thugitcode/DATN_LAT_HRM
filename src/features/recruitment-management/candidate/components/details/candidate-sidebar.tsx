import { Textarea } from '@heroui/react';
import { IconDownload, IconUser } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { cn, formatDate } from '@/lib/utils';
import type { ICandidate } from '@/features/recruitment-management/recruitment-request-details/types/type';

import { GENDER_LABEL } from '@/features/recruitment-management/constants/details';
import { icons } from '@/lib/icons';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-start items-start gap-3 py-1.5">
      <span className="text-sm min-w-[150px] text-[#71717A] shrink-0">{label}</span>
      <span className="text-sm text-[#11181C] text-right">{value || '—'}</span>
    </div>
  );
}

function SideCard({
  title,
  icon,
  children,
  className
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string
}) {
  return (
    <div className={cn("bg-white p-5 flex flex-col gap-3 border-b border-b-[#11111126]", className)}>
      <h3 className="text-lg leading-7 font-medium text-[#11181C] flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

interface CandidateSidebarProps {
  candidate: ICandidate;
}

export function CandidateSidebar({ candidate }: CandidateSidebarProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  return (
    <div className="w-[511px] shrink-0 overflow-y-auto p-6 pl-0 flex flex-col">
      {/* Personal info */}
      <SideCard
        title={t('candidate.detail.personal_info')}
        icon={icons.circleUser}
        className="rounded-t-xl"
      >
        <InfoRow
          label={t('candidate.form.fields.phone')}
          value={
            <a href={`tel:${candidate.phone}`} className="text-primary bg-[#E6F1FE] px-2 py-1 rounded-full">
              {candidate.phone}
            </a>
          }
        />
        <InfoRow
          label={t('candidate.form.fields.email')}
          value={
            <a href={`mailto:${candidate.email}`} className="text-primary bg-[#E6F1FE] px-2 py-1 rounded-full break-all">
              {candidate.email}
            </a>
          }
        />
        <InfoRow
          label={t('candidate.form.fields.date_of_birth')}
          value={candidate.dateOfBirth ? dayjs(candidate.dateOfBirth).format('D/M/YYYY') : '—'}
        />
        <InfoRow
          label={t('candidate.form.fields.gender')}
          value={GENDER_LABEL[candidate.gender] ?? '—'}
        />
        <InfoRow label={t('candidate.form.fields.address')} value={candidate.address} />
      </SideCard>

      {/* Practice certificate */}
      {/* {(candidate.practiceNumber || candidate.practiceFileUrl) && ( */}
      <SideCard
        title={t('candidate.detail.practice_certificate')}
        icon={icons.medalRibonStar}
      >
        <InfoRow
          label={t('candidate.form.fields.practice_number')}
          value={candidate.practiceNumber}
        />
        <InfoRow
          label={t('candidate.form.fields.practice_issue_date')}
          value={candidate.practiceIssueDate ? formatDate(candidate.practiceIssueDate) : null}
        />
        <InfoRow
          label={t('candidate.form.fields.practice_issue_place')}
          value={candidate.practiceIssuePlace}
        />
        <InfoRow
          label={t('candidate.form.fields.practice_scope')}
          value={candidate.practiceScope}
        />
        {candidate.practiceFileUrl && (
          <div className="py-1.5 flex justify-between items-center">
            <span className="text-sm text-[#71717A]">
              {t('candidate.form.fields.practice_file')}
            </span>
            <a
              href={candidate.practiceFileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <IconDownload size={14} />
              {t('candidate.detail.download_file')}
            </a>
          </div>
        )}
      </SideCard>
      {/* )} */}

      {/* Education */}
      {(candidate.school || candidate.educationLevel) && (
        <SideCard
          title={t('candidate.detail.education')}
          icon={icons.diplomaVerified}
        >
          <InfoRow label={t('candidate.form.fields.school')} value={candidate.school} />
          <InfoRow label={t('candidate.form.fields.major')} value={candidate.major} />
          <InfoRow
            label={t('candidate.form.fields.education_level')}
            value={
              candidate.educationLevel
                ? t(`candidate.form.fields.education_level_options.${candidate.educationLevel}`)
                : null
            }
          />
          <InfoRow
            label={t('candidate.form.fields.academic_title')}
            value={
              candidate.academicTitle
                ? tc(`options.academicTitles.${candidate.academicTitle}`)
                : null
            }
          />
          <InfoRow
            label={t('candidate.form.fields.experience_years')}
            value={
              candidate.experienceYears
                ? t(`candidate.form.fields.experience_years_options.${candidate.experienceYears}`)
                : null
            }
          />
        </SideCard>
      )}

      {/* Note */}
      <div className="bg-white p-5 flex flex-col gap-3 rounded-b-xl">
        <h3 className="text-lg leading-7 font-medium text-[#11181C] flex gap-2 items-center"><span className="text-lg leading-7 font-bold text-black">#</span>{t('candidate.detail.note')}</h3>
        <Textarea
          defaultValue={candidate.note ?? ''}
          placeholder={t('candidate.detail.note_placeholder')}
          minRows={3}
          classNames={{
            inputWrapper: 'border border-[#F4F4F5] bg-white shadow-none rounded-xl',
          }}
        />
      </div>
    </div>
  );
}
