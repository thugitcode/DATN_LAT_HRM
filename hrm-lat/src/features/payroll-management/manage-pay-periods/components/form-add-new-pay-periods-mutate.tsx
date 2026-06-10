import { useMemo } from 'react';
import { Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';

import { createPayPeriodsSchema, type PayPeriodFormValues } from '../../schemas/pay-periods-schema';

export const FormAddNewPayPeriodsMutate = () => {
  const schema = useMemo(() => createPayPeriodsSchema(), []);

  const methods = useForm<PayPeriodFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      staffCode: '',
      name: '',
      departmentId: '',
      roomId: '',
      staffId: '',
      month: '',
      kpiScore: '',
      rating: '',
      evaluatorId: '',
      note: '',
    },
    mode: 'onSubmit',
  });

  const { control, handleSubmit, setValue, watch } = methods;

  return (
    <div>Vlxx</div>
    //   <FormProvider {...methods}>
    //     <Form
    //       className="flex h-full w-full max-w-full flex-col justify-between space-y-6 pt-6"
    //       validationBehavior="aria"
    //       onSubmit={handleSubmit(onSubmit, (errors) => console.error('Validation errors:', errors))}
    //     >
    //       <div className="w-full space-y-6 overflow-auto px-6">
    //         <WrapperBoxForm title={t('kpi.form.staff_info')}>

    //         </WrapperBoxForm>

    //       </div>

    //       <div className="flex w-full justify-end gap-2 bg-white px-6 pb-6 pt-3">
    //         <Button
    //           variant="light"
    //           onPress={onClose}
    //           className="border border-[#6576FF] bg-white text-[14px] font-normal text-[#6576FF]"
    //         >
    //           {tc('button.cancel')}
    //         </Button>
    //         <Button type="submit" color="primary" isLoading={isPending}>
    //           {tc('button.save')}
    //         </Button>
    //       </div>
    //     </Form>
    //   </FormProvider>
  );
};
