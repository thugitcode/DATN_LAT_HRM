import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormSelect } from '@/components/form-fields/form-select';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { useJobTitleOptions } from '@/hooks/select-options/use-job-title-options';
import { NAMESPACES } from '@/i18n/constants';
import { IconBriefcase } from '@tabler/icons-react';
import {
  contractTypeOptions,
  positionOptions,
  workTypeOptions,
} from '@/features/staff-management/staff-list-management/constants/constants';
import { icons } from '@/lib/icons';

export function ProbationJobInfoSection() {
  const { control, watch } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const managedDepartmentId = watch('managedDepartmentId');

  const { options: departmentOptions } = useDepartmentOptions();
  const { options: roomOptions } = useRoomOptions(managedDepartmentId || undefined);
  const { options: staffOptions } = useStaffOptions();
  const { options: jobTitleOptions } = useJobTitleOptions();

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-base flex items-center font-semibold text-[#11181C] gap-3">
        {icons.case}
        {t('probation.form.sections.job_info')}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <FormSelect
          control={control}
          name="managedDepartmentId"
          label={t('probation.form.fields.manage_department')}
          isRequired
          options={departmentOptions}
        />

        <FormSelect
          control={control}
          name="managedRoomId"
          label={t('probation.form.fields.manage_room')}
          options={roomOptions}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormSelect
          control={control}
          name="workType"
          label={t('probation.form.fields.work_type')}
          options={workTypeOptions.map((o) => ({ key: o.key, label: o.label }))}
        />

        <FormSelect
          control={control}
          name="jobTitleId"
          label={t('probation.form.fields.job_title')}
          isRequired
          options={jobTitleOptions.map((o) => ({ key: o.value, label: o.label }))}
        />

        <FormSelect
          control={control}
          name="position"
          label={t('probation.form.fields.position')}
          isRequired
          options={positionOptions.map((o) => ({ key: o.key, label: o.label }))}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormSelect
          control={control}
          name="contractType"
          label={t('probation.form.fields.contract_type')}
          isRequired
          options={contractTypeOptions.map((o) => ({ key: o.key, label: o.label }))}
        />

        <FormSelect
          control={control}
          name="directManagerId"
          label={t('probation.form.fields.direct_manager')}
          isRequired
          options={staffOptions}
        />

        <FormSelect
          control={control}
          name="mentorId"
          label={t('probation.form.fields.mentor')}
          isRequired
          options={staffOptions}
        />
      </div>
    </div>
  );
}
