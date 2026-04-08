import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormArea } from '@/components/form-fields/form-area';
import { FormInput } from '@/components/form-fields/form-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { EducationLevelEnum, ExperienceYearsEnum } from '@/features/recruitment-management/constants/constants';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';
import { AcademicTitleEnum } from '@/types/staff.type';

export function ProfessionalInfoSection() {
  const { control } = useFormContext<any>();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { t: tCommon } = useTranslation(NAMESPACES.COMMON);

  const educationLevelOptions = Object.values(EducationLevelEnum).map((val) => ({
    key: val,
    label: t(`candidate.form.fields.education_level_options.${val}` as any),
  }));

  const academicTitleOptions = Object.values(AcademicTitleEnum).map((val) => ({
    key: val,
    label: tCommon(`options.academicTitles.${val}`),
  }));

  const experienceYearsOptions = Object.values(ExperienceYearsEnum).map((val) => ({
    key: val,
    label: t(`candidate.form.fields.experience_years_options.${val}` as any),
  }));

  return (
    <>
      {/* Bằng cấp chuyên môn */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
        <h3 className="text-base flex gap-3 font-semibold text-[#11181C]">
          {icons.medalRibonStar}{t('candidate.form.sections.professional_degree')}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            control={control}
            name="school"
            label={t('candidate.form.fields.school')}
            placeholder="Nhập"
          />

          <FormInput
            control={control}
            name="major"
            label={t('candidate.form.fields.major')}
            placeholder="Nhập"
          />

          <FormSelect
            control={control}
            name="educationLevel"
            label={t('candidate.form.fields.education_level')}
            placeholder="Chọn"
            options={educationLevelOptions}
          />

          <FormSelect
            control={control}
            name="academicTitle"
            label={t('candidate.form.fields.academic_title')}
            placeholder="Chọn"
            options={academicTitleOptions}
          />

          <div className="col-span-2">
            <FormSelect
              control={control}
              name="experienceYears"
              label={t('candidate.form.fields.experience_years')}
              placeholder="Chọn"
              options={experienceYearsOptions}
            />
          </div>
        </div>
      </div>
    </>
  );
}
