import { useMemo, type FC } from 'react';
import { Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { Options } from '@/types/global.type';
import { ShiftTypeEnum, type Shift, type StaffWorkSchedule } from '@/types/shift-management.type';
import { useCaseCategoryOptions } from '@/hooks/options/use-case-category-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { FormArea } from '@/components/form-fields/form-area';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormInput } from '@/components/form-fields/form-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { FormTimeInput } from '@/components/form-fields/form-time-input';

import { shiftDivisinSchema, type ShiftDivisinFormValues } from '../schemas/shift-division.schema';
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
  const { options: staffOptions } = useStaffOptions();

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
      // fromDate: '',
      // toDate: '',
      startTime: shift?.startTime?.slice(0, 5),
      endTime: shift?.endTime?.slice(0, 5),

      // details: [
      //   {
      //     startTime: '',
      //     endTime: '',
      //     shiftTemplateId: '',
      //     note: '',
      //   },
      // ],
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: ShiftDivisinFormValues) => {
    console.log('values', values);
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

          <div className="py-0.5 flex  gap-3">
            <FormTimeInput
              control={control}
              name={`startTime`}
              label="Ghi chú giờ vào"
              isRequired
              disabled={shift?.shiftTemplateType === ShiftTypeEnum.FIXED}
            />

            <FormTimeInput
              control={control}
              name={`endTime`}
              label="Ghi chú giờ ra"
              isRequired
              disabled={shift?.shiftTemplateType === ShiftTypeEnum.FIXED}
            />
          </div>
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
