import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormArea } from '@/components/form-fields/form-area';
import { FormInput } from '@/components/form-fields/form-input';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { NAMESPACES } from '@/i18n/constants';
import { IconInfoCircleFilled } from '@tabler/icons-react';

interface CandidateRequirementsSectionProps {
  isReadOnly?: boolean;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
}

export const CandidateRequirementsSection = ({ isReadOnly, variant }: CandidateRequirementsSectionProps) => {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-lg font-medium text-[#11181C] tracking-wider">
        {t('form.sections.candidate_requirements')}
      </h3>
      <div className='bg-primary-50 flex items-center gap-2 p-3 rounded-2xl'>
        <IconInfoCircleFilled className='text-primary-500 size-8' />
        <span className='text-sm text-primary'>{t('form.placeholders.medical_position_note')}</span>
      </div>
      <div className="flex flex-col gap-4">
        <FormInput
          control={control}
          name="educationLevel"
          label={t('form.fields.education_level')}
          isRequired
          placeholder={t('form.placeholders.enter_education_level')}
          isReadOnly={isReadOnly}
          variant={variant}
        />

        <FormInput
          control={control}
          name="requiredCertificates"
          label={t('form.fields.required_certificates')}
          isRequired
          placeholder={t('form.placeholders.enter_certificates')}
          isReadOnly={isReadOnly}
          variant={variant}
        />

        <FormInput
          control={control}
          name="experienceYears"
          label={t('form.fields.experience_years')}
          isRequired
          placeholder={t('form.placeholders.enter_experience_years')}
          isReadOnly={isReadOnly}
          variant={variant}
        />

        <FormArea
          control={control}
          name="technicalSkills"
          label={t('form.fields.technical_skills')}
          placeholder={t('form.placeholders.enter_technical_skills')}
          minRows={3}
          isReadOnly={isReadOnly}
          variant={variant}
        />

        <FormArea
          control={control}
          name="softSkills"
          label={t('form.fields.soft_skills')}
          placeholder={t('form.placeholders.enter_soft_skills')}
          minRows={3}
          isReadOnly={isReadOnly}
          variant={variant}
        />

        <FormArea
          control={control}
          name="otherRequirements"
          label={t('form.fields.other_requirements')}
          placeholder={t('form.placeholders.enter_other_requirements')}
          minRows={3}
          isReadOnly={isReadOnly}
          variant={variant}
        />
      </div>
    </div>
  );
};
