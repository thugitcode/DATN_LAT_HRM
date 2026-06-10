import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormArea } from '@/components/form-fields/form-area';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormInput } from '@/components/form-fields/form-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { GenderEnum } from '@/features/recruitment-management/constants/candidate.constants';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';


const GENDER_OPTIONS = [
  { key: GenderEnum.MALE, label: 'Nam' },
  { key: GenderEnum.FEMALE, label: 'Nữ' },
  { key: GenderEnum.OTHER, label: 'Khác' },
];

export function PersonalInfoSection() {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-base flex font-semibold text-[#11181C] gap-3">
        {icons.circleUser}{t('candidate.form.sections.personal_info')}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={control}
          name="name"
          label={t('candidate.form.fields.name')}

          isRequired
        />

        <FormDatePicker
          control={control}
          name="dateOfBirth"
          label={t('candidate.form.fields.date_of_birth')}
        />

        <FormSelect
          control={control}
          name="gender"
          label={t('candidate.form.fields.gender')}

          isRequired
          options={GENDER_OPTIONS}
        />

        <FormInput
          control={control}
          name="phone"
          label={t('candidate.form.fields.phone')}

          isRequired
        />

        <FormInput
          control={control}
          name="email"
          label={t('candidate.form.fields.email')}

          isRequired
        />

        <FormInput
          control={control}
          name="identityCard"
          label={t('candidate.form.fields.identity_card')}

        />

        <div className="col-span-2">
          <FormArea
            control={control}
            name="address"
            label={t('candidate.form.fields.address')}

          />
        </div>
      </div>
    </div>
  );
}
