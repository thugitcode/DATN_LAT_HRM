import { useEffect, useMemo, useRef, type FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Options } from '@/types/global.type';
import {
  ShiftTypeEnum,
  StatusUpdateShift,
  type DaySchedule,
  type Shift,
  type StaffWorkSchedule,
  type UpdateShift,
} from '@/types/shift-management.type';
import { useCaseCategoryOptions } from '@/hooks/options/use-case-category-options';
import { FormArea } from '@/components/form-fields/form-area';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormSelect } from '@/components/form-fields/form-select';
import { FormTimePicker } from '@/components/form-fields/form-time-picker';

import { useDeleteShiftManagement, useUpdateShiftManagement } from '../hooks/use-shift-management';
import { useDrawer } from '@/store/useDrawer';
import { shiftDivisinSchema, type ShiftDivisinFormValues } from '../schemas/shift-division.schema';
import type {
  DepartmentWorkScheduleDetail,
  RoomWorkScheduleDetail,
  ShiftTemplateWorkScheduleDetail,
} from '../types/type';

interface ChangeShiftDivisionFormProps {
  shift?: ShiftTemplateWorkScheduleDetail;
  staffRow?: StaffWorkSchedule;
  matchedSchedule?: DaySchedule;
  workScheduleId?: string;
  shiftRow?: Shift;
  note?: string;
  department?: DepartmentWorkScheduleDetail;
  room?: RoomWorkScheduleDetail;
}

export const ChangeShiftDivisionForm: FC<Readonly<ChangeShiftDivisionFormProps>> = ({
  shift,
  staffRow,
  matchedSchedule: _matchedSchedule,
  workScheduleId,
  shiftRow,
  note,
  department,
  room,
}) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  const { options: caseCategoryOptions } = useCaseCategoryOptions();
  const { mutate } = useUpdateShiftManagement();
  const { mutate: deleteShift, isPending: isDeleting } = useDeleteShiftManagement();
  const closedDrawer = useDrawer((state) => state.onClose);
  const handleDelete = () => { if (workScheduleId) deleteShift(workScheduleId); };
  const _isMounted = useRef(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting },
  } = useForm<ShiftDivisinFormValues>({
    resolver: zodResolver(shiftDivisinSchema),
    defaultValues: {
      name: staffRow?.name ?? '',
      staffId: staffRow?.id ?? '',
      departmentId: department?.id ?? '',
      caId: shift?.id ?? '',
      roomId: room?.id ?? '',
      startTime: shiftRow?.startTime?.slice(0, 5),
      endTime: shiftRow?.endTime?.slice(0, 5),
      note: note ?? '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    reset({
      name: staffRow?.name ?? '',
      staffId: staffRow?.id ?? '',
      departmentId: department?.id ?? '',
      caId: shift?.id ?? '',
      roomId: room?.id ?? '',
      startTime: shiftRow?.startTime?.slice(0, 5),
      endTime: shiftRow?.endTime?.slice(0, 5),
      note: note ?? '',
    });
    initialCaId.current = shift?.id ?? '';
  }, [shift?.id]);

  const caId = watch('caId');
  const initialCaId = useRef(shift?.id ?? '');
  const selectedCa = caseCategoryOptions.find((ca) => ca.key === caId);
  const isFixed = selectedCa?.type === ShiftTypeEnum.FIXED && !!(selectedCa?.startTime && selectedCa?.endTime);

  useEffect(() => {
    if (caId === initialCaId.current) return;
    if (selectedCa) {
      setValue('startTime', selectedCa.startTime?.slice(0, 5) ?? '');
      setValue('endTime', selectedCa.endTime?.slice(0, 5) ?? '');
    }
  }, [caId]);

  const onSubmit = async (values: ShiftDivisinFormValues) => {
    if (shift?.id && workScheduleId) {
      const updatedDetail = {
        startTime: values.startTime,
        endTime: values.endTime,
        shiftTemplateId: values.caId ?? '',
        note: values?.note ?? '',
      };

      const payload: UpdateShift = {
        id: workScheduleId,
        data: {
          roomId: values.roomId,
          status: StatusUpdateShift.SCHEDULED,
          departmentId: values.departmentId,
          details: [updatedDetail],
        },
      };

      mutate(payload);
    }
  };

  const departmentStaffOptions: Options[] = useMemo(
    () => staffRow?.departments?.map((d) => ({ key: d.id, label: d.name })) ?? [],
    [staffRow],
  );

  const roomStaffOptions: Options[] = useMemo(
    () => staffRow?.rooms?.map((d) => ({ key: d.id, label: d.name })) ?? [],
    [staffRow],
  );

  return (
    <Form
      className="w-full space-y-2 h-full flex-1 flex flex-col justify-between"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="p-6 w-full flex-1 min-h-0 overflow-auto">
        <div className="bg-white rounded-xl p-3 space-y-3">
          <FormAutocomplete
            control={control}
            name="departmentId"
            label={t('change_shift_division.department')}
            isRequired
            options={departmentStaffOptions}
          />

          <FormAutocomplete
            control={control}
            name="roomId"
            label={t('change_shift_division.room')}
            options={roomStaffOptions}
          />

          <FormSelect
            control={control}
            name="caId"
            label={t('change_shift_division.select_shift')}
            isRequired
            disabled={isSubmitting}
            options={caseCategoryOptions}
          />

          <FormTimePicker
            control={control}
            name="startTime"
            label={
              isFixed
                ? t('shift_details.card.check_in')
                : t('change_shift_division.check_in_note')
            }
            isRequired
            disabled={isFixed}
          />

          <FormTimePicker
            control={control}
            name="endTime"
            label={
              isFixed
                ? t('shift_details.card.check_out')
                : t('change_shift_division.check_out_note')
            }
            isRequired
            disabled={isFixed}
          />

          <FormArea
            control={control}
            name="note"
            label={t('change_shift_division.reason')}
            disabled={isSubmitting}
            maxRows={16}
          />
        </div>
      </div>

      <div className="flex px-6 py-4 bg-white border-t border-[#E4E4E7] items-center justify-between sticky bottom-0 z-10 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]">
        <Button
          type="button"
          variant="bordered"
          color="danger"
          isLoading={isDeleting}
          onPress={handleDelete}
          className="h-10 px-5 rounded-xl font-medium"
        >
          Xóa phân ca
        </Button>
        <div className="flex gap-3">
          <Button
            variant="bordered"
            onPress={closedDrawer}
            className="h-10 px-5 rounded-xl border-[#6576FF] text-[#6576FF]"
          >
            {tc('button.cancel')}
          </Button>
          <Button
            type="submit"
            color="primary"
            isLoading={isSubmitting}
            className="h-10 px-5 rounded-xl"
          >
            {tc('button.update')}
          </Button>
        </div>
      </div>
    </Form>
  );
};