import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormInput } from '@/components/form-fields/form-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { useDepartmentOptions } from '@/hooks/select-options/use-department-options';
import { useJobTitleOptions } from '@/hooks/select-options/use-job-title-options';
import { useRoomOptions } from '@/hooks/select-options/use-room-options';
import { NAMESPACES } from '@/i18n/constants';
import { StaffTypeEnum, WorkingTypeEnum } from '@/types/staff.type';

interface GeneralInfoSectionProps {
  isReadOnly?: boolean;
  variant?: 'flat' | 'bordered' | 'faded' | 'underlined';
}

export const GeneralInfoSection = ({ isReadOnly, variant }: GeneralInfoSectionProps) => {
  const { control, watch, getValues } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const { options: departmentOptions } = useDepartmentOptions();
  const { options: jobTitleOptions } = useJobTitleOptions();
  const selectedDept = watch('departmentId');
  const { options: roomOptions } = useRoomOptions(selectedDept);

  const staffTypeOptions = Object.values(StaffTypeEnum).map((val) => ({
    key: val,
    label: t(`form.options.staff_type.${val}`),
  }));

  const workTypeOptions = Object.values(WorkingTypeEnum).map((val) => ({
    key: val,
    label: t(`form.options.work_type.${val}`),
  }));

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-lg font-medium text-[#11181C] tracking-wider">
        {t('form.sections.general_info')}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={control}
          name="code"
          label={t('form.fields.code')}
          placeholder={t('form.placeholders.auto_generated')}
          isDisabled
          variant={variant}
          readOnly={isReadOnly}
        />

        <FormDatePicker
          control={control}
          name="createdAt"
          label={t('form.fields.created_at')}
          isReadOnly
          variant={variant}
        />

        <FormSelect
          control={control}
          name="departmentId"
          label={t('form.fields.department')}
          isRequired
          placeholder={t('form.placeholders.select_department')}
          options={departmentOptions.map((o) => ({ key: o.value, label: o.label }))}
          readOnly={isReadOnly}
          variant={variant}
        />

        <FormSelect
          control={control}
          name="roomId"
          label={t('form.fields.room')}
          // isRequired
          placeholder={t('form.placeholders.select_room')}
          options={roomOptions.map((o) => ({ key: o.value, label: o.label }))}
          readOnly={isReadOnly}
          variant={variant}
        />

        {/* <FormInput
          control={control}
          name="position"
          label={t('form.fields.position')}
          isRequired
          readOnly={isReadOnly}
          variant={variant}
        /> */}

        <FormSelect
          control={control}
          name="jobTitleId"
          label={t('form.fields.position')}
          isRequired
          placeholder={t('form.fields.position')}
          options={jobTitleOptions.map((jt) => ({ key: jt.value, label: jt.label }))}
          readOnly={isReadOnly}
          variant={variant}
        />

        <FormSelect
          control={control}
          name="staffType"
          label={t('form.fields.staff_type')}
          isRequired
          placeholder={t('form.placeholders.select_staff_type')}
          options={staffTypeOptions}
          readOnly={isReadOnly}
          variant={variant}
        />

        <div className='col-span-2'>
          <FormSelect
            control={control}
            name="workType"
            label={t('form.fields.work_type')}
            isRequired
            placeholder={t('form.placeholders.select_work_type')}
            options={workTypeOptions}
            readOnly={isReadOnly}
            variant={variant}
          />
        </div>
      </div>
    </div>
  );
};
