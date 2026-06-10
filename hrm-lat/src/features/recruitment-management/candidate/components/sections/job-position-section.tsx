import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { useDepartmentOptions } from '@/hooks/select-options/use-department-options';
import { useRoomOptions } from '@/hooks/select-options/use-room-options';
import { NAMESPACES } from '@/i18n/constants';
import { CandidateSourceEnum } from '@/features/recruitment-management/types/candidate.type';
import { useRecruitmentRequestList } from '@/features/recruitment-management/recruitment-request-list/hooks/use-recruitment-request';
import { icons } from '@/lib/icons';
import { RecruitmentRequestStatusEnum } from '@/features/recruitment-management/recruitment-request-list/types/type';
import { WorkingTypeEnum } from '@/types/staff.type';

export function JobPositionSection({ recruitmentRequestId }: { recruitmentRequestId?: string }) {
  const { control, watch, setValue, formState: { errors } } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const selectedDept = watch('departmentId');
  const workTypeOptions = Object.values(WorkingTypeEnum).map((val) => ({
    key: val,
    label: t(`form.options.work_type.${val}`),
  }));
  const { options: departmentOptions } = useDepartmentOptions();
  const { options: roomOptions } = useRoomOptions(selectedDept);
  const sourceOptions = Object.values(CandidateSourceEnum).map((source) => ({
    key: source,
    label: t(`candidate.source.${source}` as any),
  }));

  const { data: recruitmentRequestData } = useRecruitmentRequestList({ status: RecruitmentRequestStatusEnum.RECRUITING });
  // const { data: recruitmentRequestData } = useRecruitmentRequestList({ status: RecruitmentRequestStatusEnum.RECRUITING, departmentId: selectedDept, roomId: selectedRoom });
  const recruitmentRequestOptions =
    recruitmentRequestData?.data?.map((r) => ({
      key: r.id,
      label: `${r.code} - ${r.position}`,
    })) ?? [];

  return (
    <>
      <h3 className="text-base flex font-semibold text-[#11181C] gap-3">
        {icons.case}{t('candidate.form.sections.job_position')}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <FormAutocomplete
          control={control}
          name="recruitmentRequestId"
          label={t('candidate.form.fields.position')}
          isRequired
          options={recruitmentRequestOptions}
          readOnly={!!recruitmentRequestId}
          onSelect={(value) => {
            const selectedRecruitmentRequest = recruitmentRequestData?.data?.find((r) => r.id === value);
            if (selectedRecruitmentRequest) {
              setValue('departmentId', selectedRecruitmentRequest.departmentId);
              setValue('roomId', selectedRecruitmentRequest.roomId);
              setValue('workType', selectedRecruitmentRequest.workType);
              setValue('expectedSalaryFrom', selectedRecruitmentRequest.salaryFrom);
              setValue('expectedSalaryTo', selectedRecruitmentRequest.salaryTo);
            }
          }}
        />

        <FormSelect
          control={control}
          name="workType"
          label={t('candidate.form.fields.work_type')}

          readOnly
          options={workTypeOptions}
        />

        <FormSelect
          control={control}
          name="departmentId"
          label={t('candidate.form.fields.department')}

          // isRequired
          readOnly
          options={departmentOptions.map((o) => ({ key: o.value, label: o.label }))}
          onSelect={() => {
            setValue('roomId', null);
            setValue('recruitmentRequestId', '');
          }}
        />

        <FormSelect
          control={control}
          name="roomId"
          label={t('candidate.form.fields.room')}

          options={roomOptions.map((o) => ({ key: o.value, label: o.label }))}
          onSelect={() => {
            setValue('recruitmentRequestId', '');
          }}
          readOnly
        />


        {/* Mức lương mong muốn */}
        <div className="col-span-1 flex flex-col gap-1">
          <span className="text-base text-[#52525B]">
            {t('candidate.form.fields.expected_salary')}
          </span>
          <div className="flex items-center gap-2">
            <FormNumberInput
              control={control}
              name="expectedSalaryFrom"
              placeholder="Từ"
              suffix=" VND"
              allowNegative={false}
              decimalScale={0}
            />
            <span className="text-[#71717A] shrink-0">—</span>
            <FormNumberInput
              control={control}
              name="expectedSalaryTo"
              placeholder="Đến"
              suffix=" VND"
              allowNegative={false}
              decimalScale={0}
            />
          </div>
        </div>

        <FormSelect
          control={control}
          name="source"
          label={t('candidate.form.fields.source')}

          options={sourceOptions}
        />
      </div>
    </>
  );
}
