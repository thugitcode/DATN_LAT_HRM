import { useMemo, type FC } from 'react';
import { useDrawer } from '@/store/useDrawer';
import { Button, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { Options } from '@/types/global.type';
import type { Shift, StaffWorkSchedule } from '@/types/shift-management.type';
import { useCaseCategoryOptions } from '@/hooks/options/use-case-category-options';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { FormArea } from '@/components/form-fields/form-area';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormInput } from '@/components/form-fields/form-input';
import { FormSelect } from '@/components/form-fields/form-select';

import {
  workShiftAssignSchema,
  type WorkShiftAssignFormValues,
} from '../schemas/work-shift-assign.schema';
import { FooterFrawer } from './footer-drawer';

interface ChangeShiftDivisionFormProps {
  shift?: Shift;
  staff?: StaffWorkSchedule;
}

export const ChangeShiftDivisionForm: FC<Readonly<ChangeShiftDivisionFormProps>> = ({
  shift,
  staff,
}) => {
  const { options: caseCategoryOptions } = useCaseCategoryOptions();
  const { options: roomOptions } = useRoomOptions();
  const { options: departmentOptions } = useDepartmentOptions();
  const { options: staffOptions } = useStaffOptions();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<WorkShiftAssignFormValues>({
    resolver: zodResolver(workShiftAssignSchema),
    defaultValues: {
      name: staff?.name,
      staffId: staff?.id,
      departmentId: staff?.departmentId,
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

  const onSubmit = async (values: WorkShiftAssignFormValues) => {
    console.log('values', values);
  };
  const selectedStaff = useMemo(
    () => staffOptions.find((s) => s.key === staff?.id),
    [staff?.id, staffOptions],
  );

  const departmentStaffOptions: Options[] = useMemo(
    () =>
      selectedStaff?.departments?.map((d) => ({
        label: d.name,
        key: d.id,
      })) ?? [],
    [selectedStaff],
  );

  const roomStaffOptions: Options[] = useMemo(
    () =>
      selectedStaff?.rooms?.map((r) => ({
        label: r.name,
        key: r.id,
      })) ?? [],
    [selectedStaff],
  );
  return (
    <Form
      className="w-full max-w-full space-y-2 h-full flex-1 flex flex-col justify-between "
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="p-6 w-full  flex-1 ">
        <div className="bg-white rounded-xl p-3 size-full space-y-3 overflow-auto ">
          <FormSelect
            control={control}
            name={''}
            label="Chọn ca"
            isRequired
            disabled={isSubmitting}
            options={caseCategoryOptions}
          />

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

          <FormInput
            control={control}
            name={''}
            label="Ghi chú giờ vào"
            isRequired
            disabled={isSubmitting}
          />
          <FormInput
            control={control}
            name={''}
            label="Ghi chú giờ ra"
            isRequired
            disabled={isSubmitting}
          />
          <FormArea
            control={control}
            name={'note'}
            label="Lý do"
            isRequired
            disabled={isSubmitting}
            maxRows={16}
          />
        </div>
      </div>

      <FooterFrawer isLoading={isSubmitting} />
    </Form>
  );
};
