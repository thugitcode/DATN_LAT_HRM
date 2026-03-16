/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { Button, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconTrash } from '@tabler/icons-react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type FieldErrors,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Options } from '@/types/global.type';
import { ShiftTypeEnum, type CreateStaffSchedule } from '@/types/shift-management.type';
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

const toNameKeyOptions = (items?: { name: string; id: string }[]): Options[] =>
  items?.map(({ name, id }) => ({ label: name, key: id })) ?? [];

const toDateStr = (date: Date): string => date.toISOString().split('T')[0] ?? '';

const generateDateRange = (from: string, to: string): string[] => {
  if (!from || !to) return [];
  const start = new Date(from);
  const end = new Date(to);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];
  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(toDateStr(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
};

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
};

type ShiftDetailItem = {
  shiftTemplateId: string;
  startTime: string;
  endTime: string;
  note: string;
};

type DayItem = {
  date: string;
  shifts: ShiftDetailItem[];
};

type ExtendedFormValues = WorkShiftAssignFormValues & {
  days: DayItem[];
};

const DEFAULT_SHIFT: ShiftDetailItem = {
  shiftTemplateId: '',
  startTime: '',
  endTime: '',
  note: '',
};

type UserOptions = { departments: Options[]; rooms: Options[] };

export const WorkShiftsForm = () => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

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
  
  const initialDays = useMemo<DayItem[]>(() => {
    if (!date) return [];
    const initialShift: ShiftDetailItem = shift
      ? {
          shiftTemplateId: shift.shiftTemplateId ?? '',
          startTime: normalizeTime(shift.startTime),
          endTime: normalizeTime(shift.endTime),
          note: '',
        }
      : { ...DEFAULT_SHIFT };
    return [{ date, shifts: [initialShift] }];
  }, [date, shift]);

  const methods = useForm<ExtendedFormValues>({
    resolver: zodResolver(workShiftAssignSchema) as any,
    defaultValues: {
      name: staff?.id ?? '',
      staffId: staff?.code ?? '',
      departmentId: autoFillSingle(staff?.departments ?? []),
      roomId: autoFillSingle(staff?.rooms ?? []),
      fromDate: date ?? '',
      toDate: date ?? '',
      note: '',
      days: initialDays,
    },
    mode: 'onSubmit',
  });

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { isSubmitting, errors },
  } = methods;

  const fromDate = watch('fromDate');
  const toDate = watch('toDate');
  const isLoading = isSubmitting || isPending;

  const { fields: dayFields, replace: replaceDays } = useFieldArray({ name: 'days', control });

  useEffect(() => {
    const dates = generateDateRange(fromDate, toDate);
    if (dates.length === 0) {
      replaceDays([]);
      return;
    }
    const currentDays: DayItem[] = watch('days') ?? [];
    const prevMap = new Map(currentDays.map((d) => [d.date, d.shifts]));
    replaceDays(
      dates.map((d) => ({
        date: d,
        shifts: prevMap.get(d) ?? [{ ...DEFAULT_SHIFT }],
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

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
    const departments = toNameKeyOptions(emp?.departments);
    const rooms = toNameKeyOptions(emp?.rooms);
    setUserOptions({ departments, rooms });
    setValue('departmentId', autoFillSingleOption(departments), {
      shouldValidate: departments.length === 1,
    });
    setValue('roomId', autoFillSingleOption(rooms), {
      shouldValidate: rooms.length === 1,
    });
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToFirstError = () => {
    console.log('scroll này ');
    setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const firstInvalid = container.querySelector<HTMLElement>('[aria-invalid="true"]');

      if (!firstInvalid) return;

      firstInvalid.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });

      firstInvalid.focus?.();
    }, 120);
  };

  const onSubmit = (values: WorkShiftAssignFormValues) => {
    const staffId = staffOptions.find((s) => s.code === values.staffId)?.key ?? '';

    const payloads: CreateStaffSchedule[] = values.days.map((day) => ({
      staffId,
      departmentId: values.departmentId,
      roomId: values.roomId,
      fromDate: day.date,
      toDate: day.date,
      note: values.note,
      details: day.shifts.map((s) => ({
        shiftTemplateId: s.shiftTemplateId,
        startTime: s.startTime,
        endTime: s.endTime,
        note: s.note,
      })),
    }));

    mutate(payloads);
  };

  return (
    <FormProvider {...methods}>
      <Form
        className="flex h-full w-full max-w-full flex-col justify-between space-y-6 pt-6"
        validationBehavior="aria"
        // onSubmit={handleSubmit(onSubmit)}
        onSubmit={handleSubmit(
          (values) => {
            onSubmit(values);
          },
          (errors) => {
            console.error('Validation errors:', errors);
            scrollToFirstError();
          },
        )}
      >
        <div ref={scrollContainerRef} className="w-full space-y-6 overflow-auto px-6">
          <WrapperBoxForm title={t("work_shifts_form.staff_info")}>
            <div className="grid grid-cols-2 gap-4">
              <FormAutocomplete
                control={control}
                name="staffId"
                label={t('columns.employee_code')}
                isRequired
                options={staffByCodeOptions}
                onSelect={handleSelectByCode}
                disabled={isLoading}
              />
              <FormAutocomplete
                control={control}
                name="name"
                label={t('columns.employee_name')}
                isRequired
                options={staffOptions}
                onSelect={handleSelectByName}
                disabled={isLoading}
              />
              <FormAutocomplete
                control={control}
                name="departmentId"
                label={t('change_shift_division.department')}
                isRequired
                options={userOptions.departments}
                disabled={isLoading}
              />
              <FormAutocomplete
                control={control}
                name="roomId"
                label={t('change_shift_division.room')}
                options={userOptions.rooms}
                disabled={isLoading}
              />
            </div>
          </WrapperBoxForm>

          <WrapperBoxForm title={t("work_shifts_form.shift_info")}>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <FormDatePicker
                control={control}
                name="fromDate"
                label={t('work_shifts_form.from_date')}
                isRequired
                disabled={isLoading}
              />
              <FormDatePicker
                control={control}
                name="toDate"
                label={t('work_shifts_form.to_date')}
                isRequired
                disabled={isLoading}
              />
            </div>

            <div className="space-y-3">
              {dayFields.map((dayField, dayIndex) => (
                <DayBlock
                  key={dayField.id}
                  dayIndex={dayIndex}
                  date={dayField.date}
                  isLoading={isLoading}
                  caseCategoryOptions={caseCategoryOptions}
                />
              ))}
            </div>
          </WrapperBoxForm>
        </div>

        <div className="flex w-full justify-end gap-2 bg-white px-6 pb-6 pt-3">
          <Button
            variant="light"
            onPress={onClose}
            className="border border-[#006FEE] bg-white text-[14px] font-normal text-[#006FEE]"
          >
            {tc('button.cancel')}
          </Button>
          <Button type="submit" color="primary" isLoading={isLoading}>
            {tc('button.save')}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
};

type DayBlockProps = {
  dayIndex: number;
  date: string;
  isLoading: boolean;
  caseCategoryOptions: ReturnType<typeof useCaseCategoryOptions>['options'];
};

const DayBlock = ({ dayIndex, date, isLoading, caseCategoryOptions }: DayBlockProps) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const { control } = useFormContext<ExtendedFormValues>();

  const { fields, append, remove } = useFieldArray({
    name: `days.${dayIndex}.shifts`,
    control,
  });

  return (
    <div className="p-3 rounded-[10px] border border-[#E4E4E7]">
      <div className="mb-3 flex items-center text-base font-medium text-[#1D284E] gap-2">
        {icons.calendarDate} {formatDisplayDate(date)}
      </div>

      <div className="space-y-4">
        {fields.map((shiftField, shiftIndex) => (
          <ShiftDetailRow
            key={shiftField.id}
            dayIndex={dayIndex}
            shiftIndex={shiftIndex}
            isLoading={isLoading}
            showRemove={fields.length > 1}
            caseCategoryOptions={caseCategoryOptions}
            onRemove={() => remove(shiftIndex)}
          />
        ))}

        <Button
          className="border-2 border-[#006FEE] bg-white text-[14px] font-normal text-[#006FEE]"
          type="button"
          onPress={() => append({ ...DEFAULT_SHIFT })}
          disabled={isLoading}
        >
          {icons.plusBlue}
          {t('work_shifts_form.add_shift')}
        </Button>
      </div>
    </div>
  );
};

type ShiftDetailRowProps = {
  dayIndex: number;
  shiftIndex: number;
  isLoading: boolean;
  showRemove: boolean;
  caseCategoryOptions: ReturnType<typeof useCaseCategoryOptions>['options'];
  onRemove: () => void;
};

const ShiftDetailRow = ({
  dayIndex,
  shiftIndex,
  isLoading,
  showRemove,
  caseCategoryOptions,
  onRemove,
}: ShiftDetailRowProps) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const { control, setValue, watch } = useFormContext<ExtendedFormValues>();

  const baseName = `days.${dayIndex}.shifts.${shiftIndex}` as const;

  const shiftTemplateId = watch(`${baseName}.shiftTemplateId`);
  const selectedCa = caseCategoryOptions.find((ca) => ca.key === shiftTemplateId);
  const isFixed = selectedCa?.type === ShiftTypeEnum.FIXED;

  const handleSelectShiftTemplate = (id: string) => {
    const template = caseCategoryOptions.find((e) => e.key === id);

    if (!template) return;

    if (template.type === ShiftTypeEnum.SPLIT) {
      setValue(`${baseName}.startTime`, '');
      setValue(`${baseName}.endTime`, '');
      return;
    }

    setValue(`${baseName}.startTime`, normalizeTime(template.startTime), { shouldValidate: true });
    setValue(`${baseName}.endTime`, normalizeTime(template.endTime), { shouldValidate: true });
  };

  return (
    <div className="relative ">
      {showRemove && (
        <button
          type="button"
          onClick={onRemove}
          disabled={isLoading}
          aria-label="Xóa ca"
          className="absolute right-2 top-0 cursor-pointer text-red-400 transition-colors hover:text-red-600 disabled:opacity-50"
        >
          <IconTrash size={15} />
        </button>
      )}

      <div
        className="grid grid-cols-3 items-start gap-3"
        data-field-name={`${baseName}.shiftTemplateId`}
      >
        <FormSelect
          control={control}
          name={`${baseName}.shiftTemplateId`}
          label={t('change_shift_division.select_shift')}
          isRequired
          disabled={isLoading}
          options={caseCategoryOptions}
          onSelect={handleSelectShiftTemplate}
        />
        <FormTimePicker
          control={control}
          name={`${baseName}.startTime`}
          label={t('work_shifts_form.start_time')}
          isRequired
          disabled={isLoading || isFixed}
        />
        <FormTimePicker
          control={control}
          name={`${baseName}.endTime`}
          label={t('work_shifts_form.end_time')}
          isRequired
          disabled={isLoading || isFixed}
        />
      </div>
    </div>
  );
};
