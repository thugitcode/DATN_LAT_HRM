'use client';

import { useMemo, useState } from 'react';
import { useDrawer } from '@/store/useDrawer';
import { Button, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconTrash } from '@tabler/icons-react';
import { useFieldArray, useForm } from 'react-hook-form';

import type { Options } from '@/types/global.type';
import type { CreateStaffSchedule } from '@/types/shift-management.type';
import { icons } from '@/lib/icons';
import { useCaseCategoryOptions } from '@/hooks/options/use-case-category-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormSelect } from '@/components/form-fields/form-select';
import { FormTimePicker } from '@/components/form-fields/form-time-picker';
import { WrapperBoxForm } from '@/components/wrapper-box-form';

import { useCreateShiftManagement } from '../hooks/use-shift-management';
import {
  workShiftAssignSchema,
  type WorkShiftAssignFormValues,
} from '../schemas/work-shift-assign.schema';
import type { CellDataShift } from '../types/type';

const padTimePart = (part: string) => part.padStart(2, '0');

const normalizeTime = (time: string): string => {
  if (!time) return '';
  const [h, m] = time.split(':');
  return h && m ? `${padTimePart(h)}:${padTimePart(m)}` : time;
};

const autoFillSingle = (items: { id: string }[]) =>
  items.length === 1 ? (items[0]?.id ?? '') : '';

const autoFillSingleOption = (items: Options[]) =>
  items.length === 1 ? (items[0]?.key ?? '') : '';

const DEFAULT_SHIFT_DETAIL = {
  startTime: '',
  endTime: '',
  shiftTemplateId: '',
  note: '',
} as const;

const DEFAULT_FORM_VALUES: WorkShiftAssignFormValues = {
  name: '',
  staffId: '',
  departmentId: '',
  roomId: '',
  fromDate: '',
  toDate: '',
  note: '',
  details: [{ ...DEFAULT_SHIFT_DETAIL }],
};

type UserOptions = {
  departments: Options[];
  rooms: Options[];
};

const toNameKeyOptions = (items: { name: string; id: string }[]): Options[] =>
  items.map(({ name, id }) => ({ label: name, key: id }));

export const WorkShiftsForm = () => {
  const onClose = useDrawer((state) => state.onClose);
  const data = useDrawer((state) => state.data) as CellDataShift | undefined;

  const { record, shift, date } = data ?? {};
  const { staff } = record ?? {};

  const { options: staffOptions } = useStaffOptions();
  const { options: caseCategoryOptions } = useCaseCategoryOptions();

  const { mutate, isPending } = useCreateShiftManagement();

  const staffByCodeOptions = useMemo(
    () =>
      staffOptions.map((item) => ({
        ...item,
        id: item.key,
        label: item.code,
        key: item.code,
      })),
    [staffOptions],
  );

  const [userOptions, setUserOptions] = useState<UserOptions>(() =>
    staff
      ? { departments: toNameKeyOptions(staff.departments), rooms: toNameKeyOptions(staff.rooms) }
      : { departments: [], rooms: [] },
  );

  const initialFormValues = useMemo<WorkShiftAssignFormValues>(() => {
    if (!staff) return DEFAULT_FORM_VALUES;

    return {
      name: staff.id,
      staffId: staff.code,
      departmentId: autoFillSingle(staff.departments),
      roomId: autoFillSingle(staff.rooms),
      fromDate: date ?? '',
      toDate: date ?? '',
      note: '',
      details: shift
        ? [
            {
              startTime: normalizeTime(shift.startTime),
              endTime: normalizeTime(shift.endTime),
              shiftTemplateId: shift.shiftTemplateId ?? '',
              note: '',
            },
          ]
        : [{ ...DEFAULT_SHIFT_DETAIL }],
    };
  }, [date, shift, staff]);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { isSubmitting, errors },
  } = useForm<WorkShiftAssignFormValues>({
    resolver: zodResolver(workShiftAssignSchema),
    defaultValues: initialFormValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({ name: 'details', control });

  const isLoading = isSubmitting || isPending;

  const handleSelectByCode = (code: string) => {
    const emp = staffOptions.find((e) => e.code === code);
    if (!emp) return;

    setValue('name', emp.key, { shouldValidate: true });
    applyStaffOptions(emp);
  };

  const handleSelectByName = (id: string) => {
    const emp = staffByCodeOptions.find((e) => e.id === id);
    if (!emp) return;

    setValue('staffId', emp.key, { shouldValidate: true });
    applyStaffOptions(emp);
  };

  const applyStaffOptions = (emp: (typeof staffOptions)[number]) => {
    const departments = toNameKeyOptions(emp.departments);
    const rooms = toNameKeyOptions(emp.rooms);

    setUserOptions({ departments, rooms });

    setValue('departmentId', autoFillSingleOption(departments), {
      shouldValidate: departments.length === 1,
    });
    setValue('roomId', autoFillSingleOption(rooms), {
      shouldValidate: rooms.length === 1,
    });
  };
  const handleSelectShiftTemplate = (id: string, index: number) => {
    const template = caseCategoryOptions.find((e) => e.key === id);
    if (!template) return;

    setValue(`details.${index}.startTime`, normalizeTime(template.startTime), {
      shouldValidate: true,
    });
    setValue(`details.${index}.endTime`, normalizeTime(template.endTime), {
      shouldValidate: true,
    });
  };

  const onSubmit = (values: WorkShiftAssignFormValues) => {
    const staffId = staffOptions.find((s) => s.code === values.staffId)?.key ?? '';
    mutate({ ...values, staffId } satisfies CreateStaffSchedule);
  };

  return (
    <Form
      className="flex h-full w-full max-w-full flex-col justify-between space-y-6 pt-6"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="w-full space-y-6 overflow-auto px-6">
        {/* Personnel Info */}
        <WrapperBoxForm title="Thông tin nhân sự">
          <div className="grid grid-cols-2 gap-4">
            <FormAutocomplete
              control={control}
              name="staffId"
              label="Mã nhân viên"
              isRequired
              options={staffByCodeOptions}
              onSelect={handleSelectByCode}
              disabled={isLoading}
            />

            <FormAutocomplete
              control={control}
              name="name"
              label="Tên nhân viên"
              isRequired
              options={staffOptions}
              onSelect={handleSelectByName}
              disabled={isLoading}
            />

            <FormAutocomplete
              control={control}
              name="departmentId"
              label="Khoa làm việc"
              isRequired
              options={userOptions.departments}
              disabled={isLoading}
            />

            <FormAutocomplete
              control={control}
              name="roomId"
              label="Phòng làm việc"
              options={userOptions.rooms}
              disabled={isLoading}
            />
          </div>
        </WrapperBoxForm>

        {/* Shift Info */}
        <WrapperBoxForm title="Thông tin ca làm việc">
          <div className="mb-3 space-y-3 border-b border-[#11111126] pb-3">
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
              <ShiftDetailRow
                key={item.id}
                index={index}
                control={control}
                isLoading={isLoading}
                showRemove={fields.length > 1}
                caseCategoryOptions={caseCategoryOptions}
                onRemove={() => remove(index)}
                onSelectTemplate={(id) => handleSelectShiftTemplate(id, index)}
              />
            ))}
          </div>

          {/* Field array errors */}
          <FieldError message={errors.details?.root?.message} />
          <FieldError
            message={
              typeof errors.details?.message === 'string' ? errors.details.message : undefined
            }
          />

          <Button
            className="border-2 border-[#006FEE] bg-white text-[14px] font-normal text-[#006FEE]"
            type="button"
            onPress={() => append({ ...DEFAULT_SHIFT_DETAIL })}
            disabled={isLoading}
          >
            {icons.plusBlue}
            Thêm ca
          </Button>
        </WrapperBoxForm>
      </div>

      {/* Footer Actions */}
      <div className="flex w-full justify-end gap-2 bg-white px-6 pb-6 pt-3">
        <Button
          variant="light"
          onPress={onClose}
          className="border border-[#006FEE] bg-white text-[14px] font-normal text-[#006FEE]"
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

// ─── Sub-components ───────────────────────────────────────────────────────────

type ShiftDetailRowProps = {
  index: number;
  control: ReturnType<typeof useForm<WorkShiftAssignFormValues>>['control'];
  isLoading: boolean;
  showRemove: boolean;
  caseCategoryOptions: ReturnType<typeof useCaseCategoryOptions>['options'];
  onRemove: () => void;
  onSelectTemplate: (id: string) => void;
};

const ShiftDetailRow = ({
  index,
  control,
  isLoading,
  showRemove,
  caseCategoryOptions,
  onRemove,
  onSelectTemplate,
}: ShiftDetailRowProps) => (
  <div className="relative rounded-lg border border-[#11111114] bg-[#FAFAFA] p-3">
    {showRemove && (
      <button
        type="button"
        onClick={onRemove}
        disabled={isLoading}
        aria-label="Xóa ca"
        className="absolute right-2 top-2 cursor-pointer text-red-400 transition-colors hover:text-red-600 disabled:opacity-50"
      >
        <IconTrash size={16} />
      </button>
    )}

    <div className="grid grid-cols-3 items-start gap-3">
      <FormSelect
        control={control}
        name={`details.${index}.shiftTemplateId`}
        label="Chọn ca"
        isRequired
        disabled={isLoading}
        options={caseCategoryOptions}
        onSelect={onSelectTemplate}
      />
      <FormTimePicker
        control={control}
        name={`details.${index}.startTime`}
        label="Giờ bắt đầu"
        isRequired
        disabled={isLoading}
      />
      <FormTimePicker
        control={control}
        name={`details.${index}.endTime`}
        label="Giờ kết thúc"
        isRequired
        disabled={isLoading}
      />
    </div>
  </div>
);

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="mt-1 text-xs text-red-500">{message}</p> : null;
