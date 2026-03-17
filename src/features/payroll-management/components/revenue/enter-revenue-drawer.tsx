import { useDrawer } from '@/store/useDrawer';

import { LoadingWrapper } from '@/components/loading-wrapper';

import { EnterRevenueForm } from './enter-revenue-form';
import { CardUserShift } from '@/features/timekeeping-shift-scheduling/shift-management/components/card-user-shift';
import { useGetDetailRevenue } from '../../hooks/use-revenue-management';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { Button } from '@heroui/react';
import { WrapperBoxForm } from '@/components/wrapper-box-form';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { zodResolver } from '@hookform/resolvers/zod';

export const ChangeShiftDivision = () => {
  // const dataRow = useDrawer((state) => state.data)

  // const { staff, schedules } = record || {};

  // const matchedSchedule = schedules?.find((schedule) => schedule.date === date);

  // const { data, isLoading } = useGetDetailRevenue(shift?.workScheduleId as string);

  // // const dataDetail = data?.data;
  // // const methods = useForm<ExtendedFormValues>({
  // //   resolver: zodResolver(workShiftAssignSchema) as any,
  // //   defaultValues: {
  // //     name: staff?.id ?? '',
  // //     staffId: staff?.code ?? '',
  // //     departmentId: autoFillSingle(staff?.departments ?? []),
  // //     roomId: autoFillSingle(staff?.rooms ?? []),
  // //     fromDate: date ?? '',
  // //     toDate: date ?? '',
  // //     note: '',
  // //     days: initialDays,
  // //   },
  // //   mode: 'onSubmit',
  // // });
  // // return (
  // //   <LoadingWrapper isLoading={isLoading} className="flex flex-col justify-between">
  // //     <FormProvider {...methods}>
  // //       <Form
  // //         className="flex h-full w-full max-w-full flex-col justify-between space-y-6 pt-6"
  // //         // onSubmit={handleSubmit(onSubmit)}
  // //         onSubmit={handleSubmit(
  // //           (values) => {
  // //             onSubmit(values);
  // //           },
  // //           (errors) => {
  // //             console.error('Validation errors:', errors);
  // //             scrollToFirstError();
  // //           },
  // //         )}
  // //       >
  // //         <div ref={scrollContainerRef} className="w-full space-y-6 overflow-auto px-6">
  // //           <WrapperBoxForm title={t("work_shifts_form.staff_info")}>
  // //             <div className="grid grid-cols-2 gap-4">
  // //               <FormAutocomplete
  // //                 control={control}
  // //                 name="staffId"
  // //                 label={t('columns.employee_code')}
  // //                 isRequired
  // //                 options={staffByCodeOptions}
  // //                 onSelect={handleSelectByCode}
  // //                 disabled={isLoading}
  // //               />
  // //               <FormAutocomplete
  // //                 control={control}
  // //                 name="name"
  // //                 label={t('columns.employee_name')}
  // //                 isRequired
  // //                 options={staffOptions}
  // //                 onSelect={handleSelectByName}
  // //                 disabled={isLoading}
  // //               />
  // //               <FormAutocomplete
  // //                 control={control}
  // //                 name="departmentId"
  // //                 label={t('change_shift_division.department')}
  // //                 isRequired
  // //                 options={userOptions.departments}
  // //                 disabled={isLoading}
  // //               />
  // //               <FormAutocomplete
  // //                 control={control}
  // //                 name="roomId"
  // //                 label={t('change_shift_division.room')}
  // //                 options={userOptions.rooms}
  // //                 disabled={isLoading}
  // //               />
  // //             </div>
  // //           </WrapperBoxForm>

  // //           <WrapperBoxForm title={t("work_shifts_form.shift_info")}>
  // //             <EnterRevenueForm />

  // //           </WrapperBoxForm>
  // //         </div>

  // //         <div className="flex w-full justify-end gap-2 bg-white px-6 pb-6 pt-3">
  // //           <Button
  // //             variant="light"
  // //             onPress={onClose}
  // //             className="border border-[#006FEE] bg-white text-[14px] font-normal text-[#006FEE]"
  // //           >
  // //             {tc('button.cancel')}
  // //           </Button>
  // //           <Button type="submit" color="primary" isLoading={isLoading}>
  // //             {tc('button.save')}
  // //           </Button>
  // //         </div>
  // //       </Form>
  // //     </FormProvider>

  // //   </LoadingWrapper>
  // );
};
