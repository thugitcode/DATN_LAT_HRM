/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { Button, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Status } from '@/types/global.type';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { FormArea } from '@/components/form-fields/form-area';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { LoadingWrapper } from '@/components/loading-wrapper';
import { WrapperBoxForm } from '@/components/wrapper-box-form';

import { RATING_OPTIONS } from '../constants/kpi';
import { useCreateKPIManagement, useKpiDetail } from '../hooks/use-payroll-management';
import { createKpiMutateSchema, type KpiMutateFormValues } from '../schemas/kpi-mutate-schema';
import { KpiRatingEnum, KpiSourceEnum, type Kpi, type KpiMutatePayload } from '../types/kpi.type';

export const FormKpiMutate = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  const onClose = useDrawer((state) => state.onClose);
  const dataRow = useDrawer((state) => state.data) as Kpi;

  const { data, isLoading } = useKpiDetail(dataRow?.id);

  const dataDetail = data?.data;

  const schema = useMemo(() => createKpiMutateSchema(), []);

  const { options: staffOptions } = useStaffOptions();
  const { options: departmentOptions } = useDepartmentOptions();
  const { options: roomOptions } = useRoomOptions();

  const [selectedStaff, setSelectedStaff] = useState<(typeof staffOptions)[0] | null>(null);

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

  const { mutate: muatateCreate, isPending } = useCreateKPIManagement();

  const staffByCodeOptions = staffOptions.map((item) => ({
    ...item,
    id: item.key,
    label: item.code,
    key: item.code,
  }));

  const methods = useForm<KpiMutateFormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      staffCode: dataDetail?.staff?.id ?? '',
      name: '',
      departmentId: '',
      roomId: '',
      staffId: '',
      month: '',
      kpiScore: dataDetail?.kpiScore ? String(dataDetail?.kpiScore) : '',
      rating: undefined,
      evaluatorId: '',
      source: KpiSourceEnum.WEB,
      status: Status.PENDING,
      note: '',
    },
    mode: 'onSubmit',
  });

  const { control, handleSubmit, setValue, reset } = methods;

  useEffect(() => {
    if (!dataDetail || !staffOptions.length) return;
    const emp = staffOptions.find((e) => e.key === dataDetail.staff?.id) ?? null;
    setSelectedStaff(emp);
  }, [dataDetail?.staff?.id, staffOptions]);

  useEffect(() => {
    if (!dataDetail) return;

    const emp = staffOptions.find((e) => e.key === dataDetail.staff?.id) ?? null;

    const empDepts = departmentOptions.filter((dept) =>
      emp?.departments?.some((d) => d.id === dept.key),
    );
    const empRooms = roomOptions.filter((room) => emp?.rooms?.some((r) => r.id === room.key));

    reset({
      staffCode: dataDetail.staff?.code ?? '',
      name: dataDetail.staff?.id ?? '',
      staffId: dataDetail.staff?.id ?? '',
      departmentId: empDepts.length === 1 ? empDepts[0].key : (dataDetail.department?.id ?? ''),
      roomId: empRooms.length === 1 ? empRooms[0].key : (dataDetail.room?.id ?? ''),
      month: dataDetail.month ?? '',
      kpiScore: String(dataDetail.kpiScore ?? 0),
      rating: dataDetail.rating,
      evaluatorId: dataDetail.evaluator?.id ?? '',
      source: dataDetail.source ?? KpiSourceEnum.WEB,
      status: dataDetail.status ?? Status.PENDING,
      note: dataDetail.note ?? '',
    });
  }, [dataDetail, staffOptions, departmentOptions, roomOptions]);

  const handleSelectByCode = (code: string) => {
    const emp = staffOptions.find((e) => e.code === code);
    if (!emp) return;
    setSelectedStaff(emp);
    setValue('name', emp.key, { shouldValidate: true });
    setValue('staffId', emp.key, { shouldValidate: true });
    setValue('departmentId', '');
    setValue('roomId', '');
  };

  const handleSelectByName = (id: string) => {
    const emp = staffOptions.find((e) => e.key === id);
    if (!emp) return;
    setSelectedStaff(emp);
    setValue('staffCode', emp.code ?? '', { shouldValidate: true });
    setValue('staffId', emp.key, { shouldValidate: true });
    setValue('departmentId', '');
    setValue('roomId', '');
  };

  const onSubmit = (values: KpiMutateFormValues) => {
    const payload: KpiMutatePayload = {
      staffId: values.staffId,
      month: '2026-03',
      kpiScore: Number(values.kpiScore),
      rating: values.rating as KpiRatingEnum,
      evaluatorId: values.evaluatorId,
      source: values.source,
      status: values.status,
    };

    muatateCreate(payload);
  };

  return (
    <LoadingWrapper isLoading={isLoading}>
      <FormProvider {...methods}>
        <Form
          className="flex h-full w-full max-w-full flex-col justify-between space-y-6 pt-6"
          validationBehavior="aria"
          onSubmit={handleSubmit(onSubmit, (errors) => console.error('Validation errors:', errors))}
        >
          <div className="w-full space-y-6 overflow-auto px-6">
            <WrapperBoxForm title={t('kpi.form.staff_info')}>
              <div className="grid grid-cols-2 gap-4">
                <FormAutocomplete
                  control={control}
                  name="staffCode"
                  label={t('kpi.form.staff_code')}
                  isRequired
                  options={staffByCodeOptions}
                  onSelect={handleSelectByCode}
                  disabled={isPending}
                />
                <FormAutocomplete
                  control={control}
                  name="name"
                  label={t('kpi.form.staff_name')}
                  isRequired
                  options={staffOptions}
                  onSelect={handleSelectByName}
                  disabled={isPending}
                />
                <FormSelect
                  control={control}
                  name="departmentId"
                  label={t('kpi.form.department')}
                  isRequired
                  options={filteredDepartmentOptions}
                  disabled={isPending}
                />
                <FormSelect
                  control={control}
                  name="roomId"
                  label={t('kpi.form.room')}
                  isRequired
                  options={filteredRoomOptions}
                  disabled={isPending}
                />
              </div>
            </WrapperBoxForm>

            <WrapperBoxForm title={t('kpi.form.kpi_section')}>
              <div className="space-y-4">
                <FormNumberInput
                  control={control}
                  name="kpiScore"
                  label={t('kpi.form.kpi_score')}
                  isRequired
                  placeholder={tc('input.placeholder')}
                  min={0}
                  max={100}
                  disabled={isPending}
                />

                <FormSelect
                  control={control}
                  name="evaluatorId"
                  label={t('kpi.form.evaluator')}
                  isRequired
                  options={staffOptions}
                  disabled={isPending}
                />

                <FormSelect
                  control={control}
                  name="rating"
                  label={t('kpi.form.rank')}
                  options={RATING_OPTIONS}
                  disabled={isPending}
                  isRequired
                />

                <FormArea
                  control={control}
                  name="note"
                  label={t('kpi.form.note')}
                  placeholder={tc('input.placeholder')}
                  disabled={isPending}
                  minRows={4}
                />
              </div>
            </WrapperBoxForm>
          </div>

          <div className="flex w-full justify-end gap-2 bg-white px-6 pb-6 pt-3">
            <Button
              variant="light"
              onPress={onClose}
              className="border border-[#006FEE] bg-white text-[14px] font-normal text-[#006FEE]"
            >
              {tc('button.cancel')}
            </Button>
            <Button type="submit" color="primary" isLoading={isPending}>
              {tc('button.save')}
            </Button>
          </div>
        </Form>
      </FormProvider>
    </LoadingWrapper>
  );
};
