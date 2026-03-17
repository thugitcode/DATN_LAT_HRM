/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { Button, Form, Input } from '@heroui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { WrapperBoxForm } from '@/components/wrapper-box-form';
import { LoadingWrapper } from '@/components/loading-wrapper';

import { useGetDetailRevenue } from '../../hooks/use-revenue-management';
import { EnterRevenueForm } from './enter-revenue-form';
import type { CellDataShift } from '@/features/timekeeping-shift-scheduling/shift-management/types/type';

export const EnterRevenueDrawer = () => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  const onClose = useDrawer((state) => state.onClose);
  const dataRow = useDrawer((state) => state.data) as any;
  console.log(dataRow, 8888888);

  // Lấy dữ liệu trực tiếp từ dataRow để hiển thị (View only)
  const { record, shift, staff } = dataRow ?? {};

  // Hiển thị danh sách tên phòng ban/phòng bằng chuỗi
  const departmentNames = staff?.departments?.map(d => d.name).join(', ') ?? '';
  const roomNames = staff?.rooms?.map(r => r.name).join(', ') ?? '';

  const { isLoading: isDetailLoading } = useGetDetailRevenue(shift?.workScheduleId as string);

  const methods = useForm({
    mode: 'onSubmit',
  });

  const { handleSubmit, formState: { isSubmitting } } = methods;
  const isLoading = isDetailLoading || isSubmitting;

  const onSubmit = (values: any) => {
    // Logic xử lý submit doanh thu từ EnterRevenueForm
    console.log('Submit values:', values);
  };

  return (
    <LoadingWrapper isLoading={isDetailLoading} className="flex flex-col h-full">
      <FormProvider {...methods}>
        <Form
          className="flex h-full w-full max-w-full flex-col justify-between space-y-6 pt-6"
          validationBehavior="aria"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="w-full space-y-6 overflow-auto px-6">
            {/* Form trên: Chỉ View dữ liệu nhân viên */}
            <WrapperBoxForm title={t("work_shifts_form.staff_info")}>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label={t('columns.employee_code')}
                  value={staff?.code ?? ''}
                  isReadOnly
                  variant="bordered"
                  labelPlacement="outside"
                  placeholder=" "
                />
                <Input
                  label={t('columns.employee_name')}
                  value={staff?.name ?? ''}
                  isReadOnly
                  variant="bordered"
                  labelPlacement="outside"
                  placeholder=" "
                />
                <Input
                  label={t('change_shift_division.department')}
                  value={departmentNames}
                  isReadOnly
                  variant="bordered"
                  labelPlacement="outside"
                  placeholder=" "
                />
                <Input
                  label={t('change_shift_division.room')}
                  value={roomNames}
                  isReadOnly
                  variant="bordered"
                  labelPlacement="outside"
                  placeholder=" "
                />
              </div>
            </WrapperBoxForm>

            {/* Form dưới: Nhập doanh thu */}
            <WrapperBoxForm title={t("work_shifts_form.shift_info")}>
              <EnterRevenueForm />
            </WrapperBoxForm>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full justify-end gap-2 bg-white px-6 pb-6 pt-3">
            <Button
              variant="light"
              onPress={onClose}
              className="border border-[#006FEE] bg-white text-[14px] font-normal text-[#006FEE]"
            >
              {tc('button.cancel')}
            </Button>
            <Button type="submit" color="primary" isLoading={isLoading}>
              {tc('button.save')}
            </Button>
          </div>
        </Form>
      </FormProvider>
    </LoadingWrapper>
  );
};