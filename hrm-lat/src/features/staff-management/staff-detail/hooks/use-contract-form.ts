import { useEffect } from 'react';
import {
  useContractDetail,
  useCreateContract,
  useUpdateContract,
} from '@/query-options/staff-contract';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { staffContractSchema, type StaffContractFormValues } from '../schemas';
import { ControlMode, useControlMode } from '../../salary-and-benefits/hooks/use-control-mode-handle';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

const DEFAULT_SALARY = {
  hasHealthInsurance: false,
  healthInsuranceRate: '',
  hasSocialInsurance: false,
  socialInsuranceRate: '',
  hasUnemploymentInsurance: false,
  unemploymentInsuranceRate: '',
  hasUnionFee: false,
  unionFee: '',
  hasHealthCareInsurance: false,
  healthCareInsuranceCompany: '',
  healthCareInsuranceBenefit: '',
  healthCareInsuranceRate: '',
  basicSalary: '',
  insuranceSalary: '',
  responsibilityAllowance: '',
  positionAllowance: '',
  hazardAllowance: '',
  mealAllowance: '',
  mealAllowanceUnit: 'DAY' as const,
  fuelAllowance: '',
  phoneAllowance: '',
  businessTripAllowance: '',
  otherAllowance: '',
  leaveQuotaIds: [],
  hasFamilyDeduction: false,
  dependentsCount: '',
  hasPersonalIncomeTax: false,
  personalIncomeTaxRate: '',
};

const DEFAULT_VALUES: StaffContractFormValues = {
  contractType: '',
  workType: '',
  jobTitleId: '',
  position: '',
  workingTime: '',
  workingTimeUnit: 'MONTH',
  duration: '',
  durationUnit: 'YEAR',
  contractNumber: '',
  startDate: '',
  endDate: '',
  roomId: '',
  directManagerIds: [],
  shiftType: '',
  fixedShiftId: '',
  workingDays: [1, 2, 3, 4, 5],
  managedRoomId: '',
  managedDepartmentId: '',
  workingAreas: [{ departmentId: '', roomId: [] }],
  salary: DEFAULT_SALARY,
};

export function getContractDefaultValues(contract: NonNullable<ReturnType<typeof useContractDetail>['data']>['data']): StaffContractFormValues {
  const salaryData = contract?.salary;

  return {
    contractType: contract?.contractType || '',
    workType: contract?.workType || '',
    jobTitleId: contract?.jobTitle?.id || '',
    position: contract?.position || '',
    duration: contract?.duration?.toString() || '',
    durationUnit: contract?.durationUnit || 'YEAR',
    workingTime: contract?.workingTime?.toString() || '',
    workingTimeUnit: contract?.workingTimeUnit || 'MONTH',
    contractNumber: contract?.contractNumber || '',
    startDate: contract?.startDate || '',
    endDate: contract?.endDate || '',
    roomId: contract?.room?.id || '',
    directManagerIds: contract?.directManagerIds || [],
    shiftType: contract?.shiftType || '',
    fixedShiftId: contract?.fixedShiftId || '',
    workingDays: contract?.workingDays || [1, 2, 3, 4, 5],
    managedRoomId: contract?.managedRoom?.id || '',
    managedDepartmentId: contract?.managedDepartment?.id || '',
    workingAreas:
      contract?.departments?.map((it) => ({
        departmentId: it?.id || '',
        roomId: (contract?.rooms
          ?.filter((ite) => ite.departmentId === it?.id)
          ?.map((item) => item?.id)
          .filter(Boolean) as string[]),
      })) ?? [{ departmentId: '', roomId: [] }],
    salary: {
      hasHealthInsurance: salaryData?.hasHealthInsurance || false,
      healthInsuranceRate: salaryData?.healthInsuranceRate?.toString() || '',
      hasSocialInsurance: salaryData?.hasSocialInsurance || false,
      socialInsuranceRate: salaryData?.socialInsuranceRate?.toString() || '',
      hasUnemploymentInsurance: salaryData?.hasUnemploymentInsurance || false,
      unemploymentInsuranceRate: salaryData?.unemploymentInsuranceRate?.toString() || '',
      hasUnionFee: salaryData?.hasUnionFee || false,
      unionFee: salaryData?.unionFee?.toString() || '',
      hasHealthCareInsurance: salaryData?.hasHealthCareInsurance || false,
      healthCareInsuranceCompany: salaryData?.healthCareInsuranceCompany || '',
      healthCareInsuranceBenefit: salaryData?.healthCareInsuranceBenefit?.toString() || '',
      healthCareInsuranceRate: salaryData?.healthCareInsuranceRate?.toString() || '',
      leaveQuotaIds: salaryData?.leaveQuotaIds || [],
      hasFamilyDeduction: salaryData?.hasFamilyDeduction || false,
      dependentsCount: salaryData?.dependentsCount?.toString() || '',
      hasPersonalIncomeTax: !!salaryData?.hasPersonalIncomeTax,
      personalIncomeTaxRate: salaryData?.personalIncomeTaxRate?.toString() || '',
      basicSalary: salaryData?.basicSalary?.toString() || '',
      insuranceSalary: salaryData?.insuranceSalary?.toString() || '',
      responsibilityAllowance: salaryData?.responsibilityAllowance?.toString() || '',
      positionAllowance: salaryData?.positionAllowance?.toString() || '',
      hazardAllowance: salaryData?.hazardAllowance?.toString() || '',
      mealAllowance: salaryData?.mealAllowance?.toString() || '',
      mealAllowanceUnit: salaryData?.mealAllowanceUnit || 'DAY',
      fuelAllowance: salaryData?.fuelAllowance?.toString() || '',
      phoneAllowance: salaryData?.phoneAllowance?.toString() || '',
      businessTripAllowance: salaryData?.businessTripAllowance?.toString() || '',
      otherAllowance: salaryData?.otherAllowance?.toString() || '',
      salaryType: salaryData?.salaryType || 'NET',
      netSalary: salaryData?.netSalary?.toString() || '',
      grossSalary: salaryData?.grossSalary?.toString() || '',
    },
  };
}

interface UseContractFormParams {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  contractId?: string;
}

export function useContractForm({
  isOpen,
  onClose,
  staffId,
  contractId,
}: UseContractFormParams) {
  const isEditMode = !!contractId;

  const { data: contractRes, isLoading: isDetailLoading } = useContractDetail(
    contractId || '',
  );
  const contract = contractRes?.data;

  const createMutation = useCreateContract(staffId);
  const updateMutation = useUpdateContract(staffId);
  const queryClient = useQueryClient();
  const { setMode } = useControlMode()
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const methods = useForm<StaffContractFormValues>({
    resolver: zodResolver(staffContractSchema(t)) as any,
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Reset form khi mở drawer (create mode)
  useEffect(() => {
    if (!isOpen) return;
    if (!isEditMode) {
      reset(DEFAULT_VALUES);
    }
  }, [isOpen, isEditMode, reset]);

  // Fill data khi edit
  useEffect(() => {
    if (!contract) return;
    reset(getContractDefaultValues(contract));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(contract?.salary), contract?.id, reset]);

  const submitHandler = async (data: StaffContractFormValues) => {
    const payload = {
      staffId,
      ...data,
      duration: Number(data.duration),
      departmentIds: data.workingAreas?.map((it) => it.departmentId),
      roomIds: data.workingAreas?.map((it) => it.roomId).flat(Infinity),
      workType: data.workType || null,
    };

    if (isEditMode && contractId) {
      await updateMutation.mutateAsync({ id: contractId, data: payload }, {
        onSuccess() {
          queryClient.invalidateQueries({
            queryKey: ['salary-details', staffId],
          });
          setMode(ControlMode.view)
        },
      });
    } else {
      await createMutation.mutateAsync(payload, {
        onSuccess() {
          queryClient.invalidateQueries({
            queryKey: ['salary-details', staffId],
          });
          setMode(ControlMode.view)
        },
      });
    }
    onClose();
  };

  const onSubmit = handleSubmit(submitHandler);

  return {
    methods,
    isEditMode,
    isDetailLoading,
    isSubmitting,
    onSubmit,
    submitHandler,
    reset
  };
}