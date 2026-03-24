// sections/ContractInfoSection.tsx
import { IconChevronDown } from '@tabler/icons-react';
import type { FC } from 'react';
import { useFormContext } from 'react-hook-form';

import { useStaffList } from '@/query-options/staff';
import { StaffJobTitleEnum, StaffPositionEnum, WorkingTypeTypeEnum } from '@/types/staff.type';

// Các custom component bạn đã có
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormInput } from '@/components/form-fields/form-input';
import { FormLabel } from '@/components/form-fields/form-label';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { shiftTemplateQueryOptions } from '@/services/query-options/shift-template.query';
import { Button, Checkbox, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { WorkingAreaSection } from './working-area-section';
import { useDepartmentOptions } from '@/hooks/select-options/use-department-options';
import { useRoomOptions } from '@/hooks/select-options/use-room-options';

export const ContractInfoSection: FC = () => {
  const { control, watch, setValue, formState: { isSubmitting, errors } } = useFormContext();
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT)
  const { options: departmentOptions } = useDepartmentOptions();
  const selectedDepts = watch("managedDepartmentId");
  const { options: roomOptions } = useRoomOptions(selectedDepts);

  const { data: managersRes } = useStaffList({
    getAll: true,
    positions: [
      StaffPositionEnum.HEAD_OF_DEPARTMENT,
      StaffPositionEnum.DEPUTY_HEAD_OF_DEPARTMENT,
      StaffPositionEnum.CHIEF_NURSE,
      StaffPositionEnum.MANAGER,
      StaffPositionEnum.HEAD_OF_UNIT,
      StaffPositionEnum.DEPUTY_MANAGER,
    ],
  });
  const managers = managersRes?.data || [];

  // Watch
  const shiftType = watch('shiftType');
  // Chuẩn bị options cho các Select
  const contractTypeOptions = [
    { key: 'FULL_TIME', label: t('options.contractType.FULL_TIME') },
    { key: 'PROBATION', label: t('options.contractType.PROBATION') },
    { key: 'INTERNSHIP', label: t('options.contractType.INTERNSHIP') },
    { key: 'EXPERT_COOPERATION', label: t('options.contractType.EXPERT_COOPERATION') },
  ];

  const shiftTypeOptions = [
    { key: 'FIXED', label: t('shift_type.FIXED') },
    { key: 'FLEXIBLE', label: t('shift_type.FLEXIBLE') },
    { key: 'SPLIT', label: t('shift_type.SPLIT') },
  ];

  const managerOptions = managers.map(m => ({
    key: m.id,
    label: `${m.code} - ${m.name}`,
  }));

  const { data: shiftsRes } = useQuery({
    ...shiftTemplateQueryOptions.list({ getAll: true, type: 'FIXED', status: 'ACTIVE' }),
    enabled: shiftType === 'FIXED',
  });

  const WORKING_TIME_UNITS = [
    { key: "DAY", label: t('contract_info.working_time_units.DAY') },
    { key: "WEEK", label: t('contract_info.working_time_units.WEEK') },
    { key: "MONTH", label: t('contract_info.working_time_units.MONTH') },
  ];

  const workingTimeUnit = watch("workingTimeUnit") || "MONTH";

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        {icons.archiveBook}
        <h3 className="text-[15px] font-bold text-[#11181C]">{t('contract_info.title')}</h3>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            control={control}
            name="contractType"
            label={t('contract_info.contract_type')}
            isRequired
            options={contractTypeOptions}
            disabled={isSubmitting}
          />

          <FormSelect
            control={control}
            name="workType"
            label={t('contract_info.work_type')}
            isRequired
            options={Object.values(WorkingTypeTypeEnum).map((val) => ({
              label: t(`options.workType.${val}`),
              key: val
            }))}
            disabled={isSubmitting}
          />

          <FormSelect
            control={control}
            name="jobTitle"
            label={t('contract_info.job_title')}
            isRequired
            options={Object.values(StaffJobTitleEnum).map((val) => ({
              label: t(`options.job_title.${val}`),
              key: val
            }))}
            disabled={isSubmitting}
          />

          <FormSelect
            control={control}
            name="position"
            label={t('contract_info.position')}
            isRequired
            options={Object.values(StaffPositionEnum).map((val) => ({
              label: t(`options.staff_position.${val}`),
              key: val
            }))}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Thời hạn hợp đồng - kết hợp Input + Select unit */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1.5">
              <FormLabel label={t('contract_info.duration')} isRequired={true} isError={errors.hasOwnProperty('duration')} />

              <FormNumberInput
                control={control}
                name="duration"
                placeholder={t('contract_info.placeholders.enter')}
                isRequired
                disabled={isSubmitting}
                classNames={{
                  // inputWrapper: "pr-28", // hoặc pr-[7rem] nếu cần rộng hơn
                }}
                endContent={
                  <div className="flex items-center gap-2">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          variant="bordered"
                          className="h-8 min-h-8 min-w-[85px] border-[#E4E4E7] text-sm text-[#71717A] font-medium px-3 flex justify-between items-center rounded-lg bg-white transition-all hover:bg-gray-50"
                          endContent={<IconChevronDown size={14} />}
                          isDisabled={isSubmitting}
                        >
                          {watch('durationUnit') === 'YEAR' ? t('contract_info.duration_units.YEAR') : t('contract_info.duration_units.MONTH')}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Chọn đơn vị"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={new Set([watch('durationUnit') || 'YEAR'])}
                        onSelectionChange={(keys) => {
                          const unit = Array.from(keys)[0] as string;
                          setValue('durationUnit', unit, { shouldValidate: true });
                        }}
                      >
                        <DropdownItem key="YEAR">{t('contract_info.duration_units.YEAR')}</DropdownItem>
                        <DropdownItem key="MONTH">{t('contract_info.duration_units.MONTH')}</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                }
              />
            </div>
          </div>

          <FormInput
            control={control}
            name="contractNumber"
            label={t('contract_info.contract_number')}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormDatePicker
            control={control}
            name="startDate"
            label={t('contract_info.start_date')}
            isRequired
            disabled={isSubmitting}
          />

          <FormDatePicker
            control={control}
            name="endDate"
            label={t('contract_info.end_date')}
            isRequired
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Khoa quản lý */}
          <FormSelect
            control={control}
            name="managedDepartmentId"
            label={t('staffForm.fields.departmentIds.label')}
            selectionMode="single"
            isRequired
            disabled={isSubmitting}
            options={departmentOptions?.map(it => ({ key: it.value, label: it.label }))}
          />

          {/* Phòng quản lý */}
          <FormSelect
            control={control}
            name="managedRoomId"
            label={t('staffForm.fields.roomIds.label')}
            selectionMode="single"
            isRequired
            disabled={isSubmitting}
            options={roomOptions?.map(it => ({ key: it.value, label: it.label }))}
          />
        </div>
        <WorkingAreaSection />

        <FormSelect
          control={control}
          name="directManagerIds"
          label={t('contract_info.direct_manager')}
          isRequired
          options={managerOptions}
          disabled={isSubmitting}
          selectionMode='multiple'
        />

        <div className={cn(shiftType === 'FIXED' ? "grid grid-cols-2" : "flex w-full", "gap-4 items-end")}>
          <div className='flex-1'>
            <FormSelect
              control={control}
              name="shiftType"
              label={t('contract_info.shift_type')}
              isRequired
              options={shiftTypeOptions}
              disabled={isSubmitting}
            />
          </div>

          {shiftType === 'FIXED' && (
            <FormAutocomplete
              control={control}
              name="fixedShiftId"
              label={t('contract_info.working_shift')}
              isRequired
              placeholder={t('contract_info.placeholders.search_shift')}
              options={shiftsRes?.data?.map((s) => ({
                key: s.id,
                label: `${s.code} - ${s.name}`
              })) || []}
              disabled={isSubmitting}
            />
          )}
          <div className="flex flex-col gap-2 col-span-2 flex-1">
            <div className="flex flex-col gap-1.5">
              <FormLabel
                label={t('contract_info.working_time')}
                isRequired
                isError={!!errors.workingTime}
              />

              <FormNumberInput
                control={control}
                name="workingTime"
                placeholder={t('contract_info.placeholders.enter')}
                isRequired
                disabled={isSubmitting}
                endContent={
                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        variant="bordered"
                        isDisabled={isSubmitting}
                        className="h-8 min-h-8 min-w-[85px] border-[#E4E4E7] text-sm text-[#71717A] font-medium px-3 flex justify-between items-center rounded-lg bg-white hover:bg-gray-50"
                        endContent={<IconChevronDown size={14} />}
                      >
                        {WORKING_TIME_UNITS.find((u) => u.key === workingTimeUnit)?.label}
                      </Button>
                    </DropdownTrigger>

                    <DropdownMenu
                      aria-label="Chọn đơn vị"
                      selectionMode="single"
                      disallowEmptySelection
                      selectedKeys={new Set([workingTimeUnit])}
                      onSelectionChange={(keys) => {
                        const unit = Array.from(keys)[0] as string;
                        setValue("workingTimeUnit", unit, { shouldValidate: true });
                      }}
                    >
                      {WORKING_TIME_UNITS.map((unit) => (
                        <DropdownItem key={unit.key}>
                          {unit.label}
                        </DropdownItem>
                      ))}
                    </DropdownMenu>
                  </Dropdown>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {
        shiftType === 'FIXED' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#11181C]">
              {t('contract_info.working_days')} <span className="text-danger">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {[2, 3, 4, 5, 6, 7, 0].map((dayValue) => {
                return (
                  // Nếu chưa có FormCheckboxGroup, tạm dùng Checkbox gốc
                  // hoặc bạn tạo thêm component FormCheckbox sau
                  <Checkbox
                    key={dayValue}
                    isSelected={watch('workingDays')?.includes(dayValue) ?? false}
                    onValueChange={checked => {
                      const current = watch('workingDays') || [];
                      if (checked) {
                        setValue('workingDays', [...current, dayValue], { shouldValidate: true });
                      } else {
                        setValue('workingDays', current.filter((d: number) => d !== dayValue), { shouldValidate: true });
                      }
                    }}
                    size="sm"
                  >
                    {t(`contract_info.days.${dayValue}` as any)}
                  </Checkbox>
                );
              })}
            </div>
          </div>
        )
      }
    </div >
  );
};