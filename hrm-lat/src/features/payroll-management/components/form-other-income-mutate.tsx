/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { NAMESPACES } from '@/i18n/constants';
import { allowanceQueryOptions } from '@/services/query-options/allowance.query';
import { uploadService } from '@/services/upload.service';
import { useDrawer } from '@/store/useDrawer';
import { Button, Form } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormArea } from '@/components/form-fields/form-area';
import { FormAutocomplete } from '@/components/form-fields/form-autocomplete';
import { FormFileUploadInput } from '@/components/form-fields/form-file-upload-input';
import { FormMonthYearPicker } from '@/components/form-fields/form-month-picker';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { LoadingWrapper } from '@/components/loading-wrapper';
import { WrapperBoxForm } from '@/components/wrapper-box-form';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { useRoomOptions } from '@/hooks/options/use-room-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { AllowanceType } from '@/types/allowance.type';
import { Status } from '@/types/global.type';

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

  const { data, isLoading } = useOtherIncomeDetail(dataRow?.id ?? '');
  const dataDetail = dataRow?.id ? data?.data : undefined;

  const schema = useMemo(() => createOtherIncomeMutateSchema(), []);

  const { options: staffOptions } = useStaffOptions();
  const { options: departmentOptions } = useDepartmentOptions();
  const { options: roomOptions } = useRoomOptions();

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
      source: KpiSourceEnum.WEB,
      status: Status.PENDING,
      attachments: [],
    },
    mode: 'onSubmit',
  });
  const { control, handleSubmit, setValue, clearErrors } = methods;
  const { data: allowanceData } = useQuery(allowanceQueryOptions.list());
  const allowanceOptions =
    allowanceData?.data?.map((item) => ({
      key: item.id,
      label: item.name,
      ...item,
    })) ?? [];

  useEffect(() => {
    if (!dataDetail || staffOptions.length === 0 || hasAutofilled.current) return;

    const emp = staffOptions.find((e) => e.key === dataDetail.staff.id);
    if (emp) {
      setSelectedStaff(emp);
    }

    hasAutofilled.current = true;
  }, [staffOptions, methods]);

  useEffect(() => {
    if (!dataDetail) return;
    methods.reset({
      staffCode: dataDetail.staff?.code || '',
      name: dataDetail.staff?.id || '',
      departmentId: (dataDetail as any).departments?.[0]?.id || (dataDetail as any).staff?.departments?.[0]?.id || '',
      roomId: (dataDetail as any).rooms?.[0]?.id || (dataDetail as any).staff?.rooms?.[0]?.id || '',
      staffId: dataDetail.staff?.id || '',
      type: dataDetail.type || '',
      allowanceId: dataDetail.allowance?.id || '',
      amount: dataDetail.amount?.toString() || '',
      date: dataDetail.date || '',
      description: dataDetail.description || '',
      source: dataDetail.source || KpiSourceEnum.WEB,
      attachments:
        dataDetail.attachments?.map((item) => ({
          name: item.fileName,
          size: item.fileSize,
          type: item.fileType,
          url: item.fileUrl,
          fileUrl: item.fileUrl,
          filePath: item.filePath,
          fileName: item.fileName,
          fileType: item.fileType,
          fileSize: item.fileSize,
        })) || [],
    });
  }, [dataDetail, isLoading]);

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

  const onSubmit = async (values: OtherIncomeMutateFormValues) => {
    let attachments: {
      fileUrl: string;
      filePath: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }[] = [];

    const fileToUpload = values?.attachments?.[0];

    if (fileToUpload && !fileToUpload.fileUrl) {
      const uploadRes = await uploadService.upload(fileToUpload);

      if (uploadRes.statusCode === 200) {
        const fileData = uploadRes.data;
        attachments = [
          {
            fileUrl: fileData.url,
            filePath: fileData.filePath,
            fileName: fileData.fileName,
            fileType: fileData.fileType,
            fileSize: fileData.fileSize,
          },
        ];
      }
    }

    const payload: OtherIncomePayload = {
      staffId: values.staffId,
      month: dayjs(values.date).format('YYYY-MM'),
      type: values.type,
      description: values.description ?? '',
      amount: Number(values.amount),
      source: values.source,
      // Fix cứng trước đã
      entryPersonId: 'admin-manager-uuid',
      date: dayjs(values.date).format('YYYY-MM-DD'),
      allowanceId: values.allowanceId,
      attachments: attachments ?? [],
    };

    if (!dataDetail) {
      mutateCreate(payload);
    } else {
      mutateUpdate({ id: dataDetail.id, payload });
    }
  };
  // const typeOptions = Object.values(AllowanceType).map((val) => ({
  //   label: t(`otherIncome.allowance_type.${val}`),
  //   key: val,
  // }));
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
                  isRequired={!isDisabledStaff}
                  options={staffByCodeOptions}
                  onSelect={handleSelectByCode}
                  readOnly={isDisabledStaff}
                />
                <FormAutocomplete
                  control={control}
                  name="name"
                  label={t('otherIncome.form.staff_name')}
                  isRequired={!isDisabledStaff}
                  options={staffOptions}
                  onSelect={handleSelectByName}
                  readOnly={isDisabledStaff}
                />
                <FormSelect
                  control={control}
                  name="departmentId"
                  label={t('otherIncome.form.department')}
                  isRequired={!isDisabledStaff}
                  options={filteredDepartmentOptions}
                  readOnly={isDisabledStaff}
                  onSelect={() => clearErrors('departmentId')}
                />
                <FormSelect
                  control={control}
                  name="roomId"
                  label={t('otherIncome.form.room')}
                  isRequired={!isDisabledStaff}
                  options={filteredRoomOptions}
                  readOnly={isDisabledStaff}
                  onSelect={() => clearErrors('roomId')}
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
                  options={allowanceOptions}
                  disabled={isPending || isPendingUpdate}
                // onSelect={(item) => {
                //   setValue('type', (allowanceOptions?.find(it => it.id === item) as Allowance & Options)?.type, { shouldValidate: true });
                // }}
                />

                <FormNumberInput
                  control={control}
                  name="amount"
                  label={t('otherIncome.form.amount')}
                  isRequired
                  disabled={isPending || isPendingUpdate}
                />

                {/* <FormDatePicker
                  control={control}
                  name="date"
                  label={t('otherIncome.form.date')}
                  isRequired
                  disabled={isPending || isPendingUpdate}
                /> */}
                <FormMonthYearPicker
                  control={control}
                  name="date"
                  label={t('otherIncome.form.date')}
                  disabled={isPending || isPendingUpdate}
                  isRequired
                />

                {/* <div className="col-span-2">
                  <FormAutocomplete
                    control={control}
                    name="entryPersonId"
                    label={t('otherIncome.form.entry_person')}
                    isRequired
                    options={staffOptions}
                    disabled={isPending || isPendingUpdate}
                  />
                </div> */}

                <div className="col-span-2">
                  <FormArea
                    control={control}
                    name="description"
                    label={t('otherIncome.form.description')}
                    disabled={isPending || isPendingUpdate}
                  />
                </div>

                {/* File đính kèm — full width (UI only, không có trong payload) */}
                <div className="col-span-2">
                  <FormFileUploadInput
                    control={control}
                    name={`attachments`}
                    label={t('otherIncome.form.attachment')}
                    multiple={false}
                  />
                </div>
              </div>
            </WrapperBoxForm>
          </div>

          {/* ── Footer ── */}
          <div className="flex w-full justify-end gap-2 bg-white px-6 pb-6 pt-3">
            <Button
              variant="light"
              onPress={onClose}
              className="border border-[#6576FF] bg-white text-[14px] font-normal text-[#6576FF]"
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