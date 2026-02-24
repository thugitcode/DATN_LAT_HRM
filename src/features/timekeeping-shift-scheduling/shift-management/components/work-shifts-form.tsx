'use client';

import { useMemo } from 'react';
import { useDrawer } from '@/store/useDrawer';
import { Button, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';

import type { CreateStaffSchedule } from '@/types/shift-management.type';
import { icons } from '@/lib/icons';
import { useCaseCategoryOptions } from '@/hooks/options/use-case-category-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormDateRangePicker } from '@/components/form-fields/form-daterange-picker';
import { FormInput } from '@/components/form-fields/form-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { WrapperBoxForm } from '@/components/wrapper-box-form';

import { useCreateShiftManagement } from '../hooks/use-shift-management'; // 👈 đổi hook
import {
  workShiftAssignSchema,
  type WorkShiftAssignFormValues,
} from '../schemas/work-shift-assign.schema';

const MOCK_DEPARTMENTS = [
  { key: 'D1', label: 'Khoa Nội' },
  { key: 'D2', label: 'Khoa Ngoại' },
];

const MOCK_ROOMS = [
  { key: 'R1', label: 'Phòng 101' },
  { key: 'R2', label: 'Phòng 102' },
];

const normalizeTime = (time: string): string => {
  if (!time) return '';
  const parts = time.split(':');
  if (parts.length >= 2) {
    return `${parts?.[0]?.padStart(2, '0')}:${parts?.[1]?.padStart(2, '0')}`;
  }
  return time;
};

export const WorkShiftsForm = () => {
  const closedDrawer = useDrawer((state) => state.onClose);

  const { options: staffOptions } = useStaffOptions();
  const { options: caseCategoryOptions } = useCaseCategoryOptions();

  const { mutateAsync, isPending } = useCreateShiftManagement();

  const optionsStaffCode = useMemo(
    () =>
      staffOptions?.map((item) => ({
        ...item,
        id: item.key,
        label: item.code,
        key: item.code,
      })),
    [staffOptions],
  );

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<WorkShiftAssignFormValues>({
    resolver: zodResolver(workShiftAssignSchema),
    defaultValues: {
      name: '',
      staffId: '',
      departmentId: '',
      roomId: '',
      fromDate: '',
      toDate: '',
      note: '',
      dateRangeSchema: '',
      details: [
        {
          startTime: '',
          endTime: '',
          shiftTemplateId: '',
          note: '',
        },
      ],
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    name: 'details',
    control,
  });

  const isLoading = isSubmitting || isPending;

  const onSubmit = async (values: WorkShiftAssignFormValues) => {
    const data: CreateStaffSchedule = {
      ...values,
      staffId: staffOptions.find((s) => s.code === values.staffId)?.key || '',
      departmentId: '',
      roomId: '',
    };
    try {
      await mutateAsync(data);
      // eslint-disable-next-line no-empty
    } catch {}
  };

  const onAddCa = () => {
    append({ startTime: '', endTime: '', shiftTemplateId: '', note: '' });
  };

  return (
    <Form
      className="w-full max-w-full space-y-6 pt-6 h-full flex flex-col justify-between"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="w-full px-6 space-y-6 overflow-auto">
        <WrapperBoxForm title="Thông tin nhân sự">
          <div className="grid grid-cols-2 gap-4">
            <FormAutocomplete
              control={control}
              name="staffId"
              label="Mã nhân viên"
              isRequired
              options={optionsStaffCode}
              onSelect={(code) => {
                const emp = staffOptions.find((e) => e.code === code);
                if (!emp) return;
                setValue('name', emp.key, { shouldValidate: true });
              }}
              disabled={isLoading}
            />

            <FormAutocomplete
              control={control}
              name="name"
              label="Tên nhân viên"
              isRequired
              options={staffOptions}
              onSelect={(id) => {
                const emp = optionsStaffCode.find((e) => e.id === id);
                if (!emp) return;
                setValue('staffId', emp.key, { shouldValidate: true });
              }}
              disabled={isLoading}
            />

            <FormAutocomplete
              control={control}
              name="departmentId"
              label="Khoa làm việc"
              isRequired
              options={MOCK_DEPARTMENTS}
              disabled={isLoading}
            />

            <FormAutocomplete
              control={control}
              name="roomId"
              label="Phòng làm việc"
              options={MOCK_ROOMS}
              disabled={isLoading}
            />
          </div>
        </WrapperBoxForm>

        <WrapperBoxForm title="Thông tin ca làm việc">
          <div className="space-y-3 border-b border-[#11111126] pb-3 mb-3">
            <FormDateRangePicker
              control={control}
              name="dateRangeSchema"
              isRequired
              label="Chọn ngày"
              disabled={isLoading}
              onChange={(rangeObj) => {
                if (rangeObj?.start && rangeObj?.end) {
                  setValue('dateRangeSchema', `${rangeObj.start}~${rangeObj.end}`, {
                    shouldValidate: true,
                  });
                  setValue('fromDate', rangeObj.start.toString(), { shouldValidate: true });
                  setValue('toDate', rangeObj.end.toString(), { shouldValidate: true });
                } else {
                  setValue('dateRangeSchema', '', { shouldValidate: true });
                }
              }}
            />

            {fields.map((item, index) => (
              <div key={item.id}>
                <div className="grid grid-cols-3 gap-3 items-stretch">
                  <div className="pt-1">
                    <FormSelect
                      control={control}
                      name={`details.${index}.shiftTemplateId`}
                      label="Chọn ca"
                      isRequired
                      disabled={isLoading}
                      options={caseCategoryOptions}
                      onSelect={(id) => {
                        const emp = caseCategoryOptions.find((e) => e.key === id);
                        if (!emp) return;
                        setValue(`details.${index}.startTime`, normalizeTime(emp.startTime), {
                          shouldValidate: true,
                        });
                        setValue(`details.${index}.endTime`, normalizeTime(emp.endTime), {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>

                  <FormInput
                    control={control}
                    name={`details.${index}.startTime`}
                    label="Giờ bắt đầu"
                    type="time"
                    isRequired
                    disabled={isLoading}
                  />

                  <FormInput
                    control={control}
                    name={`details.${index}.endTime`}
                    label="Giờ kết thúc"
                    type="time"
                    isRequired
                    disabled={isLoading}
                  />
                </div>
              </div>
            ))}
          </div>

          <Button
            className="border-[#006FEE] border-2 bg-white text-[#006FEE] text-[14px] font-normal"
            type="button"
            onPress={onAddCa}
            disabled={isLoading}
          >
            {icons.plusBlue}
            Thêm ca
          </Button>
        </WrapperBoxForm>
      </div>

      <div className="flex justify-end gap-2 pt-3 pb-6 px-6 bg-white w-full">
        <Button
          variant="light"
          onPress={closedDrawer}
          className="border-[#006FEE] border bg-white text-[#006FEE] text-[14px] font-normal"
        >
          Hủy
        </Button>
        <Button type="submit" color="primary" isLoading={isLoading}>
          Lưu
        </Button>
      </div>
    </Form>
  );
};
