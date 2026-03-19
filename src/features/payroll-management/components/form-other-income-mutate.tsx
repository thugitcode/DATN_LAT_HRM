/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useMemo, useRef, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { Button, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import dayjs from 'dayjs';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Status } from '@/types/global.type';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { FormArea } from '@/components/form-fields/form-area';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { LoadingWrapper } from '@/components/loading-wrapper';
import { WrapperBoxForm } from '@/components/wrapper-box-form';

import { OTHER_INCOME_TYPE_OPTIONS } from '../constants/other-income';
import {
  useCreateOtherIncome,
  useOtherIncomeDetail,
  useUpdateOtherIncome,
} from '../hooks/use-payroll-management';
import {
  createOtherIncomeMutateSchema,
  type OtherIncomeMutateFormValues,
} from '../schemas/other-income-schema';
import { KpiSourceEnum } from '../types/kpi.type';
import type { OtherIncome, OtherIncomePayload } from '../types/other-income.type';

export const FormOtherIncomeMutate = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);
  const hasAutofilled = useRef(false);

  const onClose = useDrawer((state) => state.onClose);
  const dataRow = useDrawer((state) => state.data) as OtherIncome;

  const { data, isLoading } = useOtherIncomeDetail(dataRow?.id);
  const dataDetail = undefined;

  const schema = useMemo(() => createOtherIncomeMutateSchema(), []);

  const { options: staffOptions } = useStaffOptions();
  const { options: departmentOptions } = useDepartmentOptions();
  const { options: roomOptions } = useRoomOptions();
  const allowanceOptions: { key: string; label: string }[] = [];

  const { mutate: mutateCreate, isPending } = useCreateOtherIncome();
  const { mutate: mutateUpdate, isPending: isPendingUpdate } = useUpdateOtherIncome();

  const [selectedStaff, setSelectedStaff] = useState<(typeof staffOptions)[0] | null>(null);

  const staffByCodeOptions = staffOptions.map((item) => ({
    ...item,
    id: item.key,
    label: item.code,
    key: item.code,
  }));

  const methods = useForm<OtherIncomeMutateFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      staffCode: '',
      name: '',
      departmentId: '',
      roomId: '',
      staffId: '',
      month: '',
      type: '',
      allowanceId: '',
      amount: '',
      date: '',
      description: '',
      entryPersonId: '',
      source: KpiSourceEnum.WEB,
      status: Status.PENDING,
    },
    mode: 'onSubmit',
  });

  const { control, handleSubmit, setValue } = methods;

  // useEffect(() => {
  //   if (!dataDetail || hasAutofilled.current) return;
  //   hasAutofilled.current = true;
  // }, [dataDetail, staffOptions]);

  const applyStaffSelection = (emp: (typeof staffOptions)[0]) => {
    setSelectedStaff(emp);
    const empDepts = departmentOptions.filter((dept) =>
      emp.departments?.some((d) => d.id === dept.key),
    );
    const empRooms = roomOptions.filter((room) => emp.rooms?.some((r) => r.id === room.key));
    setValue('departmentId', empDepts.length === 1 ? (empDepts[0]?.key ?? '') : '', {
      shouldValidate: true,
    });
    setValue('roomId', empRooms.length === 1 ? (empRooms[0]?.key ?? '') : '', {
      shouldValidate: true,
    });
  };

  const handleSelectByCode = (code: string) => {
    const emp = staffOptions.find((e) => e.code === code);
    if (!emp) return;
    setValue('name', emp.key, { shouldValidate: true });
    setValue('staffId', emp.key, { shouldValidate: true });
    applyStaffSelection(emp);
  };

  const handleSelectByName = (id: string) => {
    const emp = staffOptions.find((e) => e.key === id);
    if (!emp) return;
    setValue('staffCode', emp.code ?? '', { shouldValidate: true });
    setValue('staffId', emp.key, { shouldValidate: true });
    applyStaffSelection(emp);
  };

  const filteredDepartmentOptions = useMemo(() => {
    if (!selectedStaff) return [];
    return departmentOptions.filter((dept) =>
      selectedStaff.departments?.some((d) => d.id === dept.key),
    );
  }, [selectedStaff, departmentOptions]);

  const filteredRoomOptions = useMemo(() => {
    if (!selectedStaff) return [];
    return roomOptions.filter((room) => selectedStaff.rooms?.some((r) => r.id === room.key));
  }, [selectedStaff, roomOptions]);

  const onSubmit = (values: OtherIncomeMutateFormValues) => {
    const payload: OtherIncomePayload = {
      staffId: values.staffId,
      month: dayjs().format('YYYY-MM'),
      type: values.type,
      description: values.description ?? '',
      amount: Number(values.amount),
      source: values.source,
      entryPersonId: values.entryPersonId,
      date: values.date,
      allowanceId: values.allowanceId,
    };

    console.log('payload_________________', payload);

    if (!dataDetail) {
      mutateCreate(payload);
    } else {
      mutateUpdate({ id: dataDetail.id, payload });
    }
  };

  const isDisabledStaff = isPending || isPendingUpdate || !!dataDetail;

  return (
    <LoadingWrapper isLoading={isLoading}>
      <FormProvider {...methods}>
        <Form
          className="flex h-full w-full max-w-full flex-col justify-between space-y-6 pt-6"
          validationBehavior="aria"
          onSubmit={handleSubmit(onSubmit, (errors) => console.error('Validation errors:', errors))}
        >
          <div className="w-full space-y-6 overflow-auto px-6">
            <WrapperBoxForm title={t('otherIncome.form.staff_info')}>
              <div className="grid grid-cols-2 gap-4">
                <FormAutocomplete
                  control={control}
                  name="staffCode"
                  label={t('otherIncome.form.staff_code')}
                  isRequired
                  options={staffByCodeOptions}
                  onSelect={handleSelectByCode}
                  disabled={isDisabledStaff}
                />
                <FormAutocomplete
                  control={control}
                  name="name"
                  label={t('otherIncome.form.staff_name')}
                  isRequired
                  options={staffOptions}
                  onSelect={handleSelectByName}
                  disabled={isDisabledStaff}
                />
                <FormSelect
                  control={control}
                  name="departmentId"
                  label={t('otherIncome.form.department')}
                  isRequired
                  options={filteredDepartmentOptions}
                  disabled={isDisabledStaff}
                />
                <FormSelect
                  control={control}
                  name="roomId"
                  label={t('otherIncome.form.room')}
                  isRequired
                  options={filteredRoomOptions}
                  disabled={isDisabledStaff}
                />
              </div>
            </WrapperBoxForm>

            <WrapperBoxForm title={t('otherIncome.form.account_info')}>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect
                  control={control}
                  name="type"
                  label={t('otherIncome.form.type')}
                  isRequired
                  options={OTHER_INCOME_TYPE_OPTIONS}
                  disabled={isPending || isPendingUpdate}
                />

                <FormSelect
                  control={control}
                  name="allowanceId"
                  label={t('otherIncome.form.allowance')}
                  isRequired
                  // options={allowanceOptions}
                  options={[
                    {
                      label: 'test',
                      key: 'haha',
                    },
                  ]}
                  disabled={isPending || isPendingUpdate}
                />

                <FormNumberInput
                  control={control}
                  name="amount"
                  label={t('otherIncome.form.amount')}
                  isRequired
                  disabled={isPending || isPendingUpdate}
                />

                <FormDatePicker
                  control={control}
                  name="date"
                  label={t('otherIncome.form.date')}
                  isRequired
                  disabled={isPending || isPendingUpdate}
                />

                <div className="col-span-2">
                  <FormAutocomplete
                    control={control}
                    name="entryPersonId"
                    label={t('otherIncome.form.entry_person')}
                    isRequired
                    options={staffOptions}
                    disabled={isPending || isPendingUpdate}
                  />
                </div>

                <div className="col-span-2">
                  <FormArea
                    control={control}
                    name="description"
                    label={t('otherIncome.form.description')}
                    disabled={isPending || isPendingUpdate}
                  />
                </div>

                {/* File đính kèm — full width (UI only, không có trong payload) */}
                {/* <div className="col-span-2">
                  <FormFileUpload
                    label={t('otherIncome.form.attachment')}
                    accept=".xlsx,.csv"
                    maxSizeMB={10}
                  />
                </div> */}
              </div>
            </WrapperBoxForm>
          </div>

          {/* ── Footer ── */}
          <div className="flex w-full justify-end gap-2 bg-white px-6 pb-6 pt-3">
            <Button
              variant="light"
              onPress={onClose}
              className="border border-[#006FEE] bg-white text-[14px] font-normal text-[#006FEE]"
            >
              {tc('button.cancel')}
            </Button>
            <Button type="submit" color="primary" isLoading={isPending || isPendingUpdate}>
              {tc('button.save')}
            </Button>
          </div>
        </Form>
      </FormProvider>
    </LoadingWrapper>
  );
};
