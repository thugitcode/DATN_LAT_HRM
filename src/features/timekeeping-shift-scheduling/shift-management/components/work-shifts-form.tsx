'use client';

import { useMemo, useState } from 'react';
import { useDrawer } from '@/store/useDrawer';
import { Button, DatePicker, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarDate, parseDate } from '@internationalized/date';
import type { DateValue } from '@react-types/calendar';
import { IconTrash } from '@tabler/icons-react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

import type { Options } from '@/types/global.type';
import type { CreateStaffSchedule, DepartmentUser, RoomUser } from '@/types/shift-management.type';
import { icons } from '@/lib/icons';
import { useCaseCategoryOptions } from '@/hooks/options/use-case-category-options';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormDateRangePicker } from '@/components/form-fields/form-daterange-picker';
import { FormInput } from '@/components/form-fields/form-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { WrapperBoxForm } from '@/components/wrapper-box-form';

import { useCreateShiftManagement } from '../hooks/use-shift-management';
import {
  workShiftAssignSchema,
  type WorkShiftAssignFormValues,
} from '../schemas/work-shift-assign.schema';

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

  const [departmentUser, setDepartmentUser] = useState<Options[]>([]);
  const [roomUser, setRoomUser] = useState<Options[]>([]);

  const { options: staffOptions } = useStaffOptions();
  const { options: caseCategoryOptions } = useCaseCategoryOptions();
  const { options: roomOptions } = useRoomOptions();
  const { options: departmentOptions } = useDepartmentOptions();

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
    trigger,
    formState: { isSubmitting, errors },
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
      // onSubmit={handleSubmit(onSubmit, (errors) => {
      //   console.log('Validation errors:', errors);
      // })}
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

                const deparmentOptions = emp.departments.map((item) => ({
                  label: item.name,
                  key: item.id,
                }));
                const roomOptions = emp.rooms.map((item) => ({
                  label: item.name,
                  key: item.id,
                }));

                setDepartmentUser(deparmentOptions);
                setRoomUser(roomOptions);
              }}
              disabled={isLoading}
            />

            <FormAutocomplete
              control={control}
              name="departmentId"
              label="Khoa làm việc"
              isRequired
              options={departmentUser}
              disabled={isLoading}
            />

            <FormAutocomplete
              control={control}
              name="roomId"
              label="Phòng làm việc"
              options={roomUser}
              disabled={isLoading}
            />
          </div>
        </WrapperBoxForm>

        <WrapperBoxForm title="Thông tin ca làm việc">
          <div className="space-y-3 border-b border-[#11111126] pb-3 mb-3">
            <div className="grid grid-cols-2 gap-3">
              <FormDatePicker
                control={control}
                name="fromDate"
                label="Ngày bắt đầu"
                isRequired
                disabled={isLoading}
                onTrigger={() => trigger('toDate')}
              />

              <FormDatePicker
                control={control}
                name="toDate"
                label="Ngày kết thúc"
                isRequired
                disabled={isLoading}
                onTrigger={() => trigger('fromDate')}
              />
            </div>

            {fields.map((item, index) => (
              <div
                key={item.id}
                className="relative p-3 rounded-lg border border-[#11111114] bg-[#FAFAFA]"
              >
                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={isLoading}
                    className="absolute cursor-pointer top-2 right-2 text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <IconTrash size={16} />
                  </button>
                )}

                <div className="grid grid-cols-3 gap-3 items-start">
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

          {errors.details?.root?.message && (
            <p className="text-red-500 text-xs mt-1">{errors.details.root.message}</p>
          )}

          {typeof errors.details?.message === 'string' && (
            <p className="text-red-500 text-xs mt-1">{errors.details.message}</p>
          )}

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
