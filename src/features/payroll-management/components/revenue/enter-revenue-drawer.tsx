/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { Button, Form, Input } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { Options } from '@/types/global.type';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { LoadingWrapper } from '@/components/loading-wrapper';
import { WrapperBoxForm } from '@/components/wrapper-box-form';

import {
  useCreateRevenueManagement,
  useGetDetailRevenue,
  useUpdateRevenueManagement,
} from '../../hooks/use-revenue-management';
import { revenueSchema, type RevenueFormValues } from '../../schemas/revenue.schema';
import type { RevenueDataListType } from '../../types/revenue.type';
import { EnterRevenueForm } from './enter-revenue-form';

// --- Utilities (Giữ nguyên từ mẫu WorkShiftsForm) ---
const autoFillSingle = (items: { id: string }[]) =>
  items.length === 1 ? (items[0]?.id ?? '') : '';

const autoFillSingleOption = (items: Options[]) =>
  items.length === 1 ? (items[0]?.key ?? '') : '';

const toNameKeyOptions = (items?: { name: string; id: string }[]): Options[] =>
  items?.map(({ name, id }) => ({ label: name, key: id })) ?? [];

type UserOptions = { departments: Options[]; rooms: Options[] };

export const EnterRevenueDrawer = () => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);
  const { t: tp } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { mutate: createRevenue } = useCreateRevenueManagement();
  const { mutate: updateRevenue } = useUpdateRevenueManagement();
  const onClose = useDrawer((state) => state.onClose);
  const dataRow = useDrawer((state) => state.data) as RevenueDataListType | undefined;

  const { staff } = dataRow ?? {};

  const { data: detailData, isLoading: isDetailLoading } = useGetDetailRevenue(
    dataRow?.id as string,
  );

  const { options: staffOptions } = useStaffOptions();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const staffByCodeOptions = useMemo(
    () =>
      staffOptions.map((item) => ({
        ...item,
        id: item.key,
        label: item.code,
        key: item.code,
      })),
    [staffOptions],
  );

  const [userOptions, setUserOptions] = useState<UserOptions>(() =>
    staff
      ? { departments: toNameKeyOptions(staff.departments), rooms: toNameKeyOptions(staff.rooms) }
      : { departments: [], rooms: [] },
  );

  const methods = useForm<RevenueFormValues>({
    resolver: zodResolver(revenueSchema(tp, !!dataRow?.id)) as any,
    defaultValues: {
      staffCode: staff?.code ?? '',
      name: staff?.name ?? '',
      staffId: staff?.id ?? '',
      departmentId: autoFillSingle(staff?.departments ?? []),
      roomId: autoFillSingle(staff?.rooms ?? []),
      month: '',
      targetAmount: 0,
      actualAmount: 0,
      note: '',
    },
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
    getValues,
    reset,
  } = methods;
  useEffect(() => {
    if (detailData?.data?.id) {
      reset({
        ...detailData?.data,
        departmentId: autoFillSingle(staff?.departments ?? []),
        roomId: autoFillSingle(staff?.rooms ?? []),
      });
    }
  }, [detailData?.data]);

  const isLoading = isDetailLoading || isSubmitting;

  // --- Handlers (Theo mẫu WorkShiftsForm) ---
  const handleSelectByCode = (code: string) => {
    const emp = staffOptions.find((e) => e.code === code);

    if (!emp) return;
    setValue('name', emp.key, { shouldValidate: true });
    applyStaffOptions(emp);
  };

  const handleSelectByName = (id: string) => {
    const emp = staffOptions.find((e) => e.key === id);


    if (!emp) return;

    applyStaffOptions(emp);
  };

  const applyStaffOptions = (emp: (typeof staffOptions)[number]) => {
    setValue('staffId', emp.key, { shouldValidate: true });
    setValue('staffCode', emp.code, { shouldValidate: true });

    const departments = toNameKeyOptions(emp?.departments);
    const rooms = toNameKeyOptions(emp?.rooms);
    setUserOptions({ departments, rooms });
    setValue('departmentId', autoFillSingleOption(departments), {
      shouldValidate: departments.length === 1,
    });
    setValue('roomId', autoFillSingleOption(rooms), {
      shouldValidate: rooms.length === 1,
    });
  };

  const scrollToFirstError = () => {
    setTimeout(() => {
      const container = scrollContainerRef.current;
      if (!container) return;
      const firstInvalid = container.querySelector<HTMLElement>('[aria-invalid="true"]');
      if (!firstInvalid) return;
      firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstInvalid.focus?.();
    }, 120);
  };

  const onSubmit = (values: RevenueFormValues) => {
    if (!dataRow) {
      createRevenue({
        ...values,
        achievementRate: Number(values?.achievementRate) ?? 0,
      });
    } else {
      updateRevenue({
        id: (dataRow as any).id as string,
        data: { ...values, achievementRate: Number(values?.achievementRate) ?? 0 },
      });
    }
    // Logic xử lý submit doanh thu của bạn ở đây
  };

  return (
    <LoadingWrapper isLoading={isDetailLoading} className="flex flex-col h-full">
      <FormProvider {...methods}>
        <Form
          className="flex h-full w-full max-w-full flex-col justify-between space-y-6 pt-6"
          validationBehavior="aria"
          onSubmit={handleSubmit((values) => onSubmit(values))}
        >
          <div ref={scrollContainerRef} className="w-full space-y-6 overflow-auto px-6">
            {/* Form trên: Thông tin nhân viên */}
            <WrapperBoxForm title={t('work_shifts_form.staff_info')}>
              {!dataRow?.id ? (
                <div className="grid grid-cols-2 gap-4">
                  <FormAutocomplete
                    control={control}
                    name="staffCode"
                    label={t('columns.employee_code_2')}
                    isRequired
                    options={staffByCodeOptions}
                    onSelect={handleSelectByCode}
                    disabled={isLoading}
                  />
                  <FormAutocomplete
                    control={control}
                    name="name"
                    label={t('columns.employee_name_2')}
                    isRequired
                    options={staffOptions}
                    onSelect={handleSelectByName}
                    disabled={isLoading}
                  />
                  <FormAutocomplete
                    control={control}
                    name="departmentId"
                    label={t('change_shift_division.department')}
                    isRequired
                    options={userOptions.departments}
                    disabled={isLoading}
                  />
                  <FormAutocomplete
                    control={control}
                    name="roomId"
                    label={t('change_shift_division.room')}
                    options={userOptions.rooms}
                    disabled={isLoading}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    labelPlacement="outside-top"
                    value={dataRow?.staff?.code ?? ''}
                    label={t('columns.employee_code_2')}
                    readOnly={true}
                  />
                  <Input
                    labelPlacement="outside-top"
                    value={dataRow?.staff?.name ?? ''}
                    label={t('columns.employee_name_2')}
                    readOnly={true}
                  />
                  <Input
                    labelPlacement="outside-top"
                    value={dataRow?.departments?.[0]?.name ?? ''}
                    label={t('change_shift_division.department')}
                    readOnly={true}
                  />
                  <Input
                    labelPlacement="outside-top"
                    value={dataRow?.rooms?.[0]?.name ?? ''}
                    label={t('change_shift_division.room')}
                    readOnly={true}
                  />
                </div>
              )}
            </WrapperBoxForm>

            {/* Form dưới: Nhập doanh thu */}
            <EnterRevenueForm />
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
