'use client';

import { useMemo } from 'react';
import {
  Accordion,
  AccordionItem,
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { IconTrash } from '@tabler/icons-react';
import { FormProvider, useFieldArray, useForm, useFormContext } from 'react-hook-form';

import { ShiftTypeEnum } from '@/types/shift-management.type';
import { icons } from '@/lib/icons';
import { useCaseCategoryOptions } from '@/hooks/options/use-case-category-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { FormSelect } from '@/components/form-fields/form-select';
import { FormTimePicker } from '@/components/form-fields/form-time-picker';

import type { ParseShiftResult } from '../hooks/use-shift-import';
import { useImportShiftManagement } from '../hooks/use-shift-management';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ShiftEntry {
  shiftTemplateId: string;
  startTime: string;
  endTime: string;
  note: string;
}

interface DayEntry {
  date: string;
  shifts: ShiftEntry[];
}

interface StaffEntry {
  staffCode: string;
  staffName: string;
  department: string;
  staffId: string;
  departmentId: string;
  days: DayEntry[];
}

interface ImportReviewFormValues {
  entries: StaffEntry[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DEFAULT_SHIFT: ShiftEntry = {
  shiftTemplateId: '',
  startTime: '',
  endTime: '',
  note: '',
};

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
};

const normalizeTime = (time?: string): string => {
  if (!time) return '';
  const [h, m] = time.split(':');
  return h && m ? `${h.padStart(2, '0')}:${m.padStart(2, '0')}` : time;
};

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ShiftImportReviewModalProps {
  isOpen: boolean;
  parsed: ParseShiftResult | null;
  onClose: () => void;
}

export const ShiftImportReviewModal = ({
  isOpen,
  parsed,
  onClose,
}: ShiftImportReviewModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        wrapper: 'overflow-hidden',
        base: 'my-auto max-h-[85vh]',
        body: 'p-0 overflow-y-auto',
        header: 'border-b border-[#E4E4E7] px-6 py-4 shrink-0',
        footer: 'border-t border-[#E4E4E7] px-6 py-4 shrink-0',
      }}
    >
      <ModalContent>
        {(modalClose) =>
          parsed ? (
            <ShiftImportReviewForm
              parsed={parsed}
              onClose={() => {
                onClose();
                modalClose();
              }}
            />
          ) : null
        }
      </ModalContent>
    </Modal>
  );
};

// ─── Inner Form ───────────────────────────────────────────────────────────────

interface ShiftImportReviewFormProps {
  parsed: ParseShiftResult;
  onClose: () => void;
}

const ShiftImportReviewForm = ({ parsed, onClose }: ShiftImportReviewFormProps) => {
  const { options: staffOptions } = useStaffOptions();
  const { options: caseCategoryOptions } = useCaseCategoryOptions();
  const { mutate, isPending } = useImportShiftManagement();

  const defaultEntries = useMemo<StaffEntry[]>(() => {
    return parsed.rows.map((row) => {
      const staffOption = staffOptions.find(
        (s) => s.code?.toLowerCase() === row.staffCode.toLowerCase(),
      );
      const deptOption = staffOption?.departments?.find((d) =>
        d.name.toLowerCase().includes(row.department.toLowerCase()),
      );

      // Group các ca cùng ngày → 1 DayEntry với nhiều shifts
      const sourceDays = row.days.length > 0 ? row.days : [{ date: '', shiftCode: '' }];

      const dateMap = new Map<string, ShiftEntry[]>();
      sourceDays.forEach((d) => {
        const template = d.shiftCode
          ? caseCategoryOptions.find(
              (ca) =>
                ca.label?.toLowerCase() === d.shiftCode.toLowerCase() ||
                ca.code?.toLowerCase() === d.shiftCode.toLowerCase(),
            )
          : undefined;

        let fallbackStart = '';
        let fallbackEnd = '';
        if (!template && d.rawTimeRange) {
          const parts = d.rawTimeRange.split('-');
          fallbackStart = parts[0] ? normalizeTime(parts[0].trim()) : '';
          fallbackEnd = parts[1] ? normalizeTime(parts[1].trim()) : '';
        }

        const shift: ShiftEntry = {
          shiftTemplateId: template?.key ?? '',
          startTime: template ? normalizeTime(template.startTime) : fallbackStart,
          endTime: template ? normalizeTime(template.endTime) : fallbackEnd,
          note: '',
        };

        const existing = dateMap.get(d.date);
        if (existing) existing.push(shift);
        else dateMap.set(d.date, [shift]);
      });

      const days: DayEntry[] = Array.from(dateMap.entries()).map(([date, shifts]) => ({
        date,
        shifts,
      }));

      return {
        staffCode: row.staffCode,
        staffName: row.staffName,
        department: row.department,
        staffId: staffOption?.key ?? '',
        departmentId: deptOption?.id ?? '',
        days,
      };
    });
  }, [parsed.rows, staffOptions, caseCategoryOptions]);

  const methods = useForm<ImportReviewFormValues>({
    defaultValues: { entries: defaultEntries },
  });

  const { handleSubmit, control, watch } = methods;
  const { fields: entryFields, remove: removeEntry } = useFieldArray({
    name: 'entries',
    control,
  });

  const onSubmit = (values: ImportReviewFormValues) => {
    // Flat toàn bộ entries thành 1 mảng CreateStaffSchedule[]
    // mutationFn đã xử lý array → gọi 1 lần duy nhất
    const payload = values.entries.flatMap(
      (entry) =>
        entry.days
          .filter((day) => day.date) // bỏ slot ngày trống
          .map((day) => ({
            staffId: entry.staffId,
            departmentId: entry.departmentId,
            roomId: '',
            fromDate: day.date,
            toDate: day.date,
            note: '',
            details: day.shifts
              .filter((s) => s.shiftTemplateId) // bỏ shift chưa chọn ca
              .map((s) => ({
                shiftTemplateId: s.shiftTemplateId,
                startTime: s.startTime,
                endTime: s.endTime,
                note: s.note,
              })),
          }))
          .filter((day) => day.details.length > 0), // bỏ ngày không có ca nào hợp lệ
    );

    mutate(payload, { onSuccess: onClose });
  };

  return (
    <FormProvider {...methods}>
      <form
        id="shift-import-form"
        className="flex flex-col overflow-hidden"
        onSubmit={handleSubmit(onSubmit)}
      >
        <ModalHeader className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold text-[#1D284E]">
            Xem lại dữ liệu import — Tháng {parsed.month}/{parsed.year}
          </h2>
          <p className="text-xs font-normal text-[#71717A]">
            {entryFields.length} nhân viên · Kiểm tra và chỉnh sửa trước khi lưu
          </p>
        </ModalHeader>

        <ModalBody>
          <div className="px-6 py-4">
            <Accordion
              variant="splitted"
              selectionMode="multiple"
              className="gap-2 px-0"
              itemClasses={{
                base: 'border border-[#E4E4E7] rounded-[10px] shadow-none',
                title: 'text-sm font-medium text-[#1D284E]',
                trigger: 'py-3 px-4',
                content: 'pt-0 pb-4 px-4',
              }}
            >
              {entryFields.map((entry, entryIndex) => {
                const staffName = watch(`entries.${entryIndex}.staffName`);
                const staffCode = watch(`entries.${entryIndex}.staffCode`);
                const department = watch(`entries.${entryIndex}.department`);
                const dayCount = watch(`entries.${entryIndex}.days`)?.length ?? 0;

                return (
                  <AccordionItem
                    key={entry.id}
                    aria-label={staffName}
                    title={
                      <div className="flex items-center gap-3 pr-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F1FF] text-xs font-semibold text-[#6576FF]">
                          {staffName?.charAt(0)?.toUpperCase() ?? '?'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#1D284E]">
                            {staffName || 'Chưa chọn nhân viên'}
                            {staffCode && (
                              <span className="font-normal text-[#71717A]"> · {staffCode}</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-[#71717A]">{department}</p>
                        </div>
                        <Chip size="sm" variant="flat" color="primary" className="shrink-0">
                          {dayCount} ngày
                        </Chip>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeEntry(entryIndex);
                          }}
                          className="shrink-0 rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                          title="Xóa nhân viên này"
                        >
                          <IconTrash size={15} />
                        </button>
                      </div>
                    }
                    startContent={null}
                  >
                    <StaffDayList
                      entryIndex={entryIndex}
                      isLoading={isPending}
                      caseCategoryOptions={caseCategoryOptions}
                    />
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </ModalBody>

        <ModalFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="light"
            onPress={onClose}
            className="border border-[#6576FF] bg-white text-sm font-normal text-[#6576FF]"
          >
            Hủy
          </Button>
          <Button type="submit" form="shift-import-form" color="primary" isLoading={isPending}>
            Lưu tất cả ({entryFields.length} nhân viên)
          </Button>
        </ModalFooter>
      </form>
    </FormProvider>
  );
};

// ─── StaffDayList — nội dung bên trong AccordionItem ─────────────────────────

interface StaffDayListProps {
  entryIndex: number;
  isLoading: boolean;
  caseCategoryOptions: ReturnType<typeof useCaseCategoryOptions>['options'];
}

const StaffDayList = ({ entryIndex, isLoading, caseCategoryOptions }: StaffDayListProps) => {
  const { control } = useFormContext<ImportReviewFormValues>();

  const { fields: dayFields, remove: removeDay } = useFieldArray({
    name: `entries.${entryIndex}.days`,
    control,
  });

  if (dayFields.length === 0) {
    return <p className="py-2 text-center text-xs text-[#71717A]">Không có ngày phân ca nào</p>;
  }

  return (
    <div className="space-y-3">
      {dayFields.map((dayField, dayIndex) =>
        dayField.date ? (
          <DayBlock
            key={dayField.id}
            entryIndex={entryIndex}
            dayIndex={dayIndex}
            date={dayField.date}
            isLoading={isLoading}
            caseCategoryOptions={caseCategoryOptions}
            onRemove={() => removeDay(dayIndex)}
          />
        ) : null,
      )}
    </div>
  );
};

// ─── DayBlock ─────────────────────────────────────────────────────────────────

interface DayBlockProps {
  entryIndex: number;
  dayIndex: number;
  date: string;
  isLoading: boolean;
  caseCategoryOptions: ReturnType<typeof useCaseCategoryOptions>['options'];
  onRemove: () => void;
}

const DayBlock = ({
  entryIndex,
  dayIndex,
  date,
  isLoading,
  caseCategoryOptions,
  onRemove,
}: DayBlockProps) => {
  const { control } = useFormContext<ImportReviewFormValues>();

  const {
    fields: shiftFields,
    append,
    remove: removeShift,
  } = useFieldArray({
    name: `entries.${entryIndex}.days.${dayIndex}.shifts`,
    control,
  });

  return (
    <div className="rounded-[10px] border border-[#E4E4E7] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-[#1D284E]">
          {icons.calendarDate}
          <span>
            {date ? (
              formatDisplayDate(date)
            ) : (
              <span className="text-[#A1A1AA] font-normal text-xs">Chọn ngày</span>
            )}
          </span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-400 hover:text-red-600"
          title="Xóa ngày này"
        >
          <IconTrash size={13} />
        </button>
      </div>

      <div className="space-y-4">
        {shiftFields.map((shiftField, shiftIndex) => (
          <ShiftDetailRow
            key={shiftField.id}
            entryIndex={entryIndex}
            dayIndex={dayIndex}
            shiftIndex={shiftIndex}
            isLoading={isLoading}
            showRemove={shiftFields.length > 1}
            caseCategoryOptions={caseCategoryOptions}
            onRemove={() => removeShift(shiftIndex)}
          />
        ))}

        <Button
          className="border-2 border-[#6576FF] bg-white text-[14px] font-normal text-[#6576FF]"
          type="button"
          size="sm"
          onPress={() => append({ ...DEFAULT_SHIFT })}
          disabled={isLoading}
        >
          {icons.plusBlue}
          Thêm ca
        </Button>
      </div>
    </div>
  );
};

// ─── ShiftDetailRow ───────────────────────────────────────────────────────────

interface ShiftDetailRowProps {
  entryIndex: number;
  dayIndex: number;
  shiftIndex: number;
  isLoading: boolean;
  showRemove: boolean;
  caseCategoryOptions: ReturnType<typeof useCaseCategoryOptions>['options'];
  onRemove: () => void;
}

const ShiftDetailRow = ({
  entryIndex,
  dayIndex,
  shiftIndex,
  isLoading,
  showRemove,
  caseCategoryOptions,
  onRemove,
}: ShiftDetailRowProps) => {
  const { control, setValue, watch } = useFormContext<ImportReviewFormValues>();

  const baseName = `entries.${entryIndex}.days.${dayIndex}.shifts.${shiftIndex}` as const;

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
    <div className="relative">
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

      <div className="grid grid-cols-3 items-start gap-3">
        <FormSelect
          control={control}
          name={`${baseName}.shiftTemplateId`}
          label="Chọn ca"
          isRequired
          disabled={isLoading}
          options={caseCategoryOptions}
          onSelect={handleSelectShiftTemplate}
        />
        <FormTimePicker
          control={control}
          name={`${baseName}.startTime`}
          label="Giờ bắt đầu"
          isRequired
          disabled={isLoading || isFixed}
        />
        <FormTimePicker
          control={control}
          name={`${baseName}.endTime`}
          label="Giờ kết thúc"
          isRequired
          disabled={isLoading || isFixed}
        />
      </div>
    </div>
  );
};
