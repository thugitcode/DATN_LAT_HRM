import { useEffect, useMemo, useRef, type FC } from 'react';
import { Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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

import { useUpdateShiftManagement } from '../hooks/use-shift-management';
import { shiftDivisinSchema, type ShiftDivisinFormValues } from '../schemas/shift-division.schema';
import type {
  DepartmentWorkScheduleDetail,
  RoomWorkScheduleDetail,
  ShiftTemplateWorkScheduleDetail,
} from '../types/type';
import { FooterFrawer } from './footer-drawer';

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
  matchedSchedule,
  workScheduleId,
  shiftRow,
  note,
  department,
  room,
}) => {
  const { options: caseCategoryOptions } = useCaseCategoryOptions();

  const { mutate } = useUpdateShiftManagement();
  const isMounted = useRef(false);

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
  const isFixed = selectedCa?.type === ShiftTypeEnum.FIXED;

  useEffect(() => {
    if (caId === initialCaId.current) return;

    if (selectedCa) {
      setValue('startTime', selectedCa.startTime?.slice(0, 5) ?? '');
      setValue('endTime', selectedCa.endTime?.slice(0, 5) ?? '');
    }
  }, [caId]);

  const onSubmit = async (values: ShiftDivisinFormValues) => {
    if (shift?.id && workScheduleId) {
      const otherDetails =
        matchedSchedule?.shifts
          ?.filter((s) => s.workScheduleId !== workScheduleId)
          ?.map((s) => ({
            startTime: s.startTime,
            endTime: s.endTime,
            shiftTemplateId: s.shiftTemplateId ?? '',
            // note: s.note ?? '',
          })) ?? [];

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
          // details: [...otherDetails, updatedDetail],
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
      className="w-full space-y-2 h-full flex-1 flex flex-col justify-between "
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="p-6 w-full flex-1 min-h-0 overflow-auto">
        <div className="bg-white rounded-xl p-3 space-y-3 ">
          <FormAutocomplete
            control={control}
            name="departmentId"
            label="Khoa làm việc"
            isRequired
            options={departmentStaffOptions}
          />

          <FormAutocomplete
            control={control}
            name="roomId"
            label="Phòng làm việc"
            options={roomStaffOptions}
          />

          <FormSelect
            control={control}
            name={'caId'}
            label="Chọn ca"
            isRequired
            disabled={isSubmitting}
            options={caseCategoryOptions}
          />

          <FormTimePicker
            control={control}
            name={`startTime`}
            label={isFixed ? "Giờ vào" : "Ghi chú giờ vào"}
            isRequired
            // disabled={caId === ShiftTypeEnum.FIXED}
            disabled={isFixed}
          />

          <FormTimePicker
            control={control}
            name={`endTime`}
            label={isFixed ? "Giờ ra" : "Ghi chú giờ ra"}
            isRequired
            // disabled={caId === ShiftTypeEnum.FIXED}
            disabled={isFixed}
          />

          <FormArea
            control={control}
            name={'note'}
            label="Lý do"
            disabled={isSubmitting}
            maxRows={16}
          />
        </div>
      </div>

      <FooterFrawer isLoading={isSubmitting} submitLabel="Cập nhật" />
    </Form>
  );
};
