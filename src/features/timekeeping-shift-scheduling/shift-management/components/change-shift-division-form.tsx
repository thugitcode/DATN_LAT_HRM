import { useDrawer } from '@/store/useDrawer';
import { Button, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useCaseCategoryOptions } from '@/hooks/options/use-case-category-options';
import { FormArea } from '@/components/form-fields/form-area';
import { FormInput } from '@/components/form-fields/form-input';
import { FormSelect } from '@/components/form-fields/form-select';

import {
  workShiftAssignSchema,
  type WorkShiftAssignFormValues,
} from '../schemas/work-shift-assign.schema';
import { FooterFrawer } from './footer-drawer';

export const ChangeShiftDivisionForm = () => {
  const { options: caseCategoryOptions } = useCaseCategoryOptions();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
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
      dateRangeSchema: '',
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

  return (
    <Form
      className="w-full max-w-full space-y-6 h-full flex flex-col justify-between"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="p-6 w-full">
        <div className="bg-white rounded-xl p-3 size-full space-y-3 ">
          <FormSelect
            control={control}
            name={''}
            label="Chọn ca"
            isRequired
            disabled={isSubmitting}
            options={caseCategoryOptions}
          />

          <FormSelect
            control={control}
            name={''}
            label="Khoa làm việc"
            isRequired
            disabled={isSubmitting}
            options={[]}
          />

          <FormSelect
            control={control}
            name={''}
            label="Phòng làm việc"
            isRequired
            disabled={isSubmitting}
            options={[]}
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
            name={''}
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
