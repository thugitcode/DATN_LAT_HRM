import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconCertificate } from '@tabler/icons-react';

import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormInput } from '@/components/form-fields/form-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { NAMESPACES } from '@/i18n/constants';
import {
  qualificationOptions,
} from '@/features/staff-management/staff-list-management/constants/constants';
import { StaffAcademicTitleEnum } from '@/types/staff.type';

const ACADEMIC_TITLE_OPTIONS = [
  { key: StaffAcademicTitleEnum.DOCTOR, label: 'Bác sĩ' },
  { key: StaffAcademicTitleEnum.MASTER, label: 'Thạc sĩ' },
  { key: StaffAcademicTitleEnum.PHD, label: 'Tiến sĩ' },
  { key: StaffAcademicTitleEnum.SPECIALIST_I, label: 'CKI' },
  { key: StaffAcademicTitleEnum.SPECIALIST_II, label: 'CKII' },
  { key: StaffAcademicTitleEnum.RESIDENT_PHYSICIAN, label: 'Nội trú' },
  { key: StaffAcademicTitleEnum.PROFESSOR, label: 'Giáo sư' },
  { key: StaffAcademicTitleEnum.ASSOCIATE_PROFESSOR, label: 'Phó giáo sư' },
  { key: StaffAcademicTitleEnum.PEOPLES_PHYSICIAN, label: 'Thầy thuốc nhân dân' },
  { key: StaffAcademicTitleEnum.EMINENT_PHYSICIAN, label: 'Thầy thuốc ưu tú' },
  { key: StaffAcademicTitleEnum.BACHELOR, label: 'Cử nhân' },
  { key: StaffAcademicTitleEnum.ENGINEER, label: 'Kỹ sư' },
];

export function ProbationQualificationSection() {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-base flex items-center font-semibold text-[#11181C] gap-3">
        <IconCertificate size={18} />
        {t('probation.form.sections.qualification' as any)}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          control={control}
          name="qualification"
          label={t('probation.form.fields.qualification' as any)}

          isRequired
          options={qualificationOptions.map((o) => ({ key: o.key, label: o.label }))}
        />

        <FormInput
          control={control}
          name="major"
          label={t('probation.form.fields.major' as any)}

        />

        <FormSelect
          control={control}
          name="academicTitle"
          label={t('probation.form.fields.academic_title' as any)}

          options={ACADEMIC_TITLE_OPTIONS}
        />

        <FormInput
          control={control}
          name="certificateNumber"
          label={t('probation.form.fields.certificate_number' as any)}

        />

        <FormInput
          control={control}
          name="certificateIssuePlace"
          label={t('probation.form.fields.certificate_issue_place' as any)}

        />

        <FormDatePicker
          control={control}
          name="certificateExpiryDate"
          label={t('probation.form.fields.certificate_expiry_date' as any)}
        />
      </div>
    </div>
  );
}
