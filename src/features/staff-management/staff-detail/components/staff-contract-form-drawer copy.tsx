// staff-contract-form-drawer.tsx
import type { FC } from 'react';
import { useEffect } from 'react';
import { useForm, FormProvider, Form } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from '@heroui/react';
// import các section component sẽ tạo sau
import { useContractDetail } from '@/query-options/staff-contract';
import { staffContractSchema, type StaffContractFormValues } from '../schemas';
import { ContractInfoSection } from './sections/contract-info-section';
import { InsuranceAndUnionSection } from './sections/insurance-and-union-section';
import { HealthCareInsuranceSection } from './sections/health-care-insurance-section';
import { SalaryStructureSection } from './sections/salary-structure-section';
import { SalaryInfoSection } from './sections/salary-info-section';
import { LeaveBenefitsSection } from './sections/leave-benefits-section';
import { PersonalIncomeTaxSection } from './sections/personal-income-tax-section';
import { BtnCancel } from '@/components/btn-cancel';
// import các query hooks khác giữ nguyên...

interface StaffContractFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: string;
  contractId?: string;
}

export const StaffContractFormDrawer: FC<StaffContractFormDrawerProps> = ({
  isOpen,
  onClose,
  staffId,
  contractId,
}) => {
  const isEditMode = !!contractId;
  const { data: contractRes, isLoading: isDetailLoading } = useContractDetail(contractId || '');
  const contract = contractRes?.data;

  const methods = useForm<StaffContractFormValues>({
    resolver: zodResolver(staffContractSchema),
    defaultValues: {
      contractType: '',
      workType: '',
      jobTitle: '',
      position: '',
      duration: '',
      durationUnit: 'YEAR',
      contractNumber: '',
      startDate: '',
      endDate: '',
      departmentId: '',
      roomId: '',
      directManagerIds: [],
      shiftType: '',
      fixedShiftId: '',
      workingDays: [1, 2, 3, 4, 5],
      salary: {
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
        hasPersonalIncomeTax: true,
        personalIncomeTaxRate: ''
      },
      // thêm default cho các field khác sau
    },
    mode: 'onChange',
  });

  const { handleSubmit, reset, formState: { isSubmitting, errors } } = methods;

  // Reset form khi mở drawer (create mode)
  useEffect(() => {
    if (!isOpen) return;

    if (!isEditMode) {
      reset({
        contractType: '',
        workType: '',
        jobTitle: '',
        position: '',
        duration: '',
        durationUnit: 'YEAR',
        contractNumber: '',
        startDate: '',
        endDate: '',
        departmentId: '',
        roomId: '',
        directManagerIds: [],
        shiftType: '',
        fixedShiftId: '',
        workingDays: [1, 2, 3, 4, 5],
        workingAreas: [{ departmentId: "", roomId: "" }],
        salary: {
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

          hasPersonalIncomeTax: true,
        },
      });
    }
  }, [isOpen, isEditMode, reset]);

  // Fill data khi edit
  useEffect(() => {
    if (!contract) return;

    reset({
      contractType: contract.contractType || '',
      workType: contract.workType || '',
      jobTitle: contract.jobTitle || '',
      position: contract.position || '',
      duration: contract.duration?.toString() || '',
      durationUnit: contract.durationUnit || 'YEAR',
      contractNumber: contract.contractNumber || '',
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
      departmentId: contract.department?.id || '',
      roomId: contract.room?.id || '',
      directManagerIds: contract.directManagerIds || [],
      shiftType: contract.shiftType || '',
      fixedShiftId: contract.fixedShiftId || '',
      workingDays: contract.workingDays || [1, 2, 3, 4, 5],

      // bổ sung salary, workingAreas,... sau
    });
  }, [contract, reset]);

  const onSubmit = handleSubmit(async (data) => {
    // chuyển đổi dữ liệu phù hợp với API payload
    const payload = {
      staffId,
      ...data,
      duration: Number(data.duration),
      workingAreas: [], // sẽ xử lý ở section sau
      salary: {}, // sẽ xử lý sau
      // ... map các field khác
    };
    console.log(payload,7777);
    
    // if (isEditMode && contractId) {
    //   await updateMutation.mutateAsync({ id: contractId, data: payload });
    // } else {
    //   await createMutation.mutateAsync(payload);
    // }
    onClose();
  });
  console.log(errors, 333, errors);

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="full"
      placement="right"
      classNames={{ base: 'bg-[#FAFAFA]' }}
    >
      <DrawerContent>
        <DrawerHeader className="...">
          <h2 className="text-xl font-bold text-[#11181C]">
            {isEditMode ? 'Chỉnh sửa hợp đồng' : 'Thêm mới hợp đồng'}
          </h2>
        </DrawerHeader>

        <DrawerBody className="p-6 overflow-y-auto w-full">
          {isDetailLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#006FEE] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <FormProvider {...methods}>
              <Form onSubmit={() => onSubmit()} className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                {/* Bắt đầu với phần Thông tin hợp đồng */}
                <div className="flex flex-col gap-6 pb-18">
                  <ContractInfoSection />
                  <InsuranceAndUnionSection />
                  <HealthCareInsuranceSection />
                  {/* Sau này thêm: WorkingAreaSection, InsuranceSection, ... */}
                </div>

                <div className="flex flex-col gap-6">
                  {/* Các section bên phải sẽ thêm sau */}
                  <SalaryStructureSection />
                  <SalaryInfoSection />
                  <LeaveBenefitsSection />
                  <PersonalIncomeTaxSection />
                </div>
                <div className='absolute bottom-0 bg-white p-4 w-full left-0 flex justify-end gap-2 z-10'>
                  <BtnCancel isDisabled={isSubmitting} onPress={onClose} />
                  <Button
                    type='submit'
                    color="primary"
                    // onClick={onSubmit}
                    isLoading={isSubmitting}
                  >
                    Lưu lại
                  </Button>
                </div>
              </Form>
            </FormProvider>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};