import { useMemo, type FC } from 'react';
import { Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { Options } from '@/types/global.type';
import {
  StatusUpdateShift,
  type DaySchedule,
  type Shift,
  type StaffWorkSchedule,
  type UpdateShift,
} from '@/types/shift-management.type';
import { useCaseCategoryOptions } from '@/hooks/options/use-case-category-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { FormArea } from '@/components/form-fields/form-area';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormSelect } from '@/components/form-fields/form-select';
import { FormTimePicker } from '@/components/form-fields/form-time-picker';

import { useUpdateShiftManagement } from '../hooks/use-shift-management';
import { shiftDivisinSchema, type ShiftDivisinFormValues } from '../schemas/shift-division.schema';
import { FooterFrawer } from './footer-drawer';

interface ChangeShiftDivisionFormProps {
  shift?: Shift;
  staff?: StaffWorkSchedule;
  matchedSchedule?: DaySchedule;
}

export const ChangeShiftDivisionForm: FC<Readonly<ChangeShiftDivisionFormProps>> = ({
  shift,
  staff,
  matchedSchedule,
}) => {
  const { options: caseCategoryOptions } = useCaseCategoryOptions();
  const { options: staffOptions } = useStaffOptions();

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
      caId: shift?.shiftTemplateId ?? '',
      roomId: staff?.rooms?.length === 1 ? staff?.rooms?.[0]?.id : '',

      startTime: shift?.startTime?.slice(0, 5),
      endTime: shift?.endTime?.slice(0, 5),
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ShiftDivisinFormValues) => {
    if (shift?.workScheduleId) {
      const payload: UpdateShift = {
        id: shift.workScheduleId,
        data: {
          note: values.note ?? '',
          roomId: values.roomId,
          status: StatusUpdateShift.SCHEDULED,
          details: [
            {
              startTime: values.startTime,
              endTime: values.endTime,
              shiftTemplateId: values.caId ?? '',
              note: values?.note,
            },
          ],
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
          />

          <FormTimePicker
            control={control}
            name={`endTime`}
            label="Ghi chú giờ ra"
            isRequired
            // disabled={caId === ShiftTypeEnum.FIXED}
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
