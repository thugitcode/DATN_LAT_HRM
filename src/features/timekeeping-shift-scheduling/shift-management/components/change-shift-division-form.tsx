import { useMemo, type FC } from 'react';
import { Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { Options } from '@/types/global.type';
import {
  ShiftTypeEnum,
  StatusUpdateShift,
  type DaySchedule,
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
import type { ShiftTemplateWorkScheduleDetail } from '../types/type';
import { FooterFrawer } from './footer-drawer';

interface ChangeShiftDivisionFormProps {
  shift?: ShiftTemplateWorkScheduleDetail;
  staff?: StaffWorkSchedule;
  matchedSchedule?: DaySchedule;
  workScheduleId?: string;
}

export const ChangeShiftDivisionForm: FC<Readonly<ChangeShiftDivisionFormProps>> = ({
  shift,
  staff,
  matchedSchedule,
  workScheduleId,
}) => {
  const { options: caseCategoryOptions } = useCaseCategoryOptions();

  const { mutate } = useUpdateShiftManagement();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<ShiftDivisinFormValues>({
    resolver: zodResolver(shiftDivisinSchema),
    defaultValues: {
      name: staff?.name ?? '',
      staffId: staff?.id ?? '',
      departmentId: staff?.departments?.length === 1 ? staff?.departments?.[0]?.id : '',
      caId: shift?.id ?? '',
      roomId: staff?.rooms?.length === 1 ? staff?.rooms?.[0]?.id : '',

      startTime: shift?.startTime?.slice(0, 5),
      endTime: shift?.endTime?.slice(0, 5),
      note: shift?.note ?? '',
    },
    mode: 'onChange',
  });

  const caId = watch('caId');

  const selectedCa = caseCategoryOptions.find((ca) => ca.key === caId);
  const isFixed = selectedCa?.type === ShiftTypeEnum.FIXED;

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
          details: [...otherDetails, updatedDetail],
        },
      };

      mutate(payload);
    }
  };

  const departmentStaffOptions: Options[] = useMemo(
    () => staff?.departments?.map((d) => ({ key: d.id, label: d.name })) ?? [],
    [staff],
  );

  const roomStaffOptions: Options[] = useMemo(
    () => staff?.rooms?.map((d) => ({ key: d.id, label: d.name })) ?? [],

    [staff],
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
            label="Ghi chú giờ vào"
            isRequired
            // disabled={caId === ShiftTypeEnum.FIXED}
            disabled={isFixed}
          />

          <FormTimePicker
            control={control}
            name={`endTime`}
            label="Ghi chú giờ ra"
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
