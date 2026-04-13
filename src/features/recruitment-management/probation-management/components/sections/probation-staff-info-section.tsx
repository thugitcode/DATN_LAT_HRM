import { Input } from '@heroui/react';
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

interface Props {
  code?: string;
}

export function ProbationStaffInfoSection({ code }: Props) {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-base flex items-center font-semibold text-[#11181C] gap-3">
        {icons.circleUser}
        {t('probation.form.sections.staff_info')}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#11181C]">
            {t('probation.form.fields.code')}
          </span>
          <Input
            value={code ?? '—'}
            isDisabled
            classNames={{
              inputWrapper: 'bg-[#F4F4F5] shadow-none border-none',
              input: 'text-[#71717A]',
            }}
          />
        </div>

        <FormInput
          control={control}
          name="name"
          label={t('probation.form.fields.name')}

          isRequired
        />
        <FormInput
          control={control}
          name="phone"
          label={t('probation.form.fields.phone')}
          isRequired
        />
        <FormInput
          control={control}
          name="email"
          label={t('probation.form.fields.email')}
          isRequired
        />

        <FormDatePicker
          control={control}
          name="birthday"
          label={t('probation.form.fields.birthday')}
          isRequired
        />

        <FormSelect
          control={control}
          name="gender"
          label={t('probation.form.fields.gender')}

          isRequired
          options={GENDER_OPTIONS}
        />

        <FormInput
          control={control}
          name="identity"
          label={t('probation.form.fields.identity')}

        />

        <FormDatePicker
          control={control}
          name="identityIssueDate"
          label={t('probation.form.fields.identity_issue_date')}
        />

        <FormInput
          control={control}
          name="identityIssuePlace"
          label={t('probation.form.fields.identity_issue_place')}

        />

        <FormInput
          control={control}
          name="nationality"
          label={t('probation.form.fields.nationality')}

        />

        <div className="col-span-2">
          <FormArea
            control={control}
            name="address"
            label={t('probation.form.fields.address')}

          />
        </div>
      </div>
    </div>
  );
}
