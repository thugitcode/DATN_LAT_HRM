// staff-contract-form-drawer.tsx
import type { FC } from 'react';
import { useEffect } from 'react';
// import các section component sẽ tạo sau
import {
  useContractDetail,
  useCreateContract,
  useUpdateContract,
} from '@/query-options/staff-contract';
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormProvider, useForm } from 'react-hook-form';

import { BtnCancel } from '@/components/btn-cancel';

import { staffContractSchema, type StaffContractFormValues } from '../schemas';
import { ContractInfoSection } from './sections/contract-info-section';
import { HealthCareInsuranceSection } from './sections/health-care-insurance-section';
import { InsuranceAndUnionSection } from './sections/insurance-and-union-section';
import { LeaveBenefitsSection } from './sections/leave-benefits-section';
import { PersonalIncomeTaxSection } from './sections/personal-income-tax-section';
import { SalaryInfoSection } from './sections/salary-info-section';
import { SalaryStructureSection } from './sections/salary-structure-section';

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

  const createMutation = useCreateContract(staffId);
  const updateMutation = useUpdateContract(staffId);

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
        personalIncomeTaxRate: '',
      },
      // thêm default cho các field khác sau
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = methods;

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
        roomId: '',
        directManagerIds: [],
        shiftType: '',
        fixedShiftId: '',
        workingDays: [1, 2, 3, 4, 5],
        workingAreas: [{ departmentId: '', roomId: '' }],
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

    const salaryData = contract.salary;

    reset({
      // ── Thông tin hợp đồng ───────────────────────────────────────
      contractType: contract.contractType || '',
      workType: contract.workType || '',
      jobTitle: contract.jobTitle || '',
      position: contract.position || '',
      duration: contract.duration?.toString() || '',
      durationUnit: contract.durationUnit || 'YEAR',
      contractNumber: contract.contractNumber || '',
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
      roomId: contract.room?.id || '',
      directManagerIds: contract.directManagerIds || [],
      shiftType: contract.shiftType || '',
      fixedShiftId: contract.fixedShiftId || '',
      workingDays: contract.workingDays || [1, 2, 3, 4, 5],

      // ── Khu vực làm việc (workingAreas) ───────────────────────────
      workingAreas:
        (contract?.staff?.rlsStaffDepartments ?? [])?.length > 0
          ? contract?.staff?.rlsStaffDepartments?.map((rsd: any, idx: number) => {
            const deptId = rsd.department?.id || '';
            // Tìm phòng khớp với khoa (lấy phòng đầu tiên nếu có nhiều)
            const matchingRoom = contract.staff?.rlsStaffRooms?.find(
              (rsr: any) => rsr.room?.department?.id === deptId,
            );
            return {
              departmentId: deptId,
              roomId: matchingRoom?.room?.id || '',
            };
          })
          : [{ departmentId: '', roomId: '' }], // fallback nếu không có data

      // ── Salary object ─────────────────────────────────────────────
      salary: {
        // Bảo hiểm & công đoàn
        hasHealthInsurance: salaryData?.hasHealthInsurance || false,
        healthInsuranceRate: salaryData?.healthInsuranceRate?.toString() || '',
        hasSocialInsurance: salaryData?.hasSocialInsurance || false,
        socialInsuranceRate: salaryData?.socialInsuranceRate?.toString() || '',
        hasUnemploymentInsurance: salaryData?.hasUnemploymentInsurance || false,
        unemploymentInsuranceRate: salaryData?.unemploymentInsuranceRate?.toString() || '',
        hasUnionFee: salaryData?.hasUnionFee || false,
        unionFee: salaryData?.unionFee?.toString() || '',

        // Bảo hiểm sức khỏe
        hasHealthCareInsurance: salaryData?.hasHealthCareInsurance || false,
        healthCareInsuranceCompany: salaryData?.healthCareInsuranceCompany || '',
        healthCareInsuranceBenefit: salaryData?.healthCareInsuranceBenefit?.toString() || '',
        healthCareInsuranceRate: salaryData?.healthCareInsuranceRate?.toString() || '',

        // Nghỉ phép & phúc lợi
        leaveQuotaIds: salaryData?.leaveQuotaIds || [],

        // Thuế TNCN
        hasFamilyDeduction: salaryData?.hasFamilyDeduction || false,
        dependentsCount: salaryData?.dependentsCount?.toString() || '',
        hasPersonalIncomeTax: salaryData?.hasPersonalIncomeTax ?? true,
        personalIncomeTaxRate: salaryData?.personalIncomeTaxRate?.toString() || '',

        // Cấu trúc lương
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

        // Thông tin lương
        salaryType: salaryData?.salaryType || 'NET',
        netSalary: salaryData?.netSalary?.toString() || '',
        grossSalary: salaryData?.grossSalary?.toString() || '',
      },
    });
  }, [contract, reset]);

  const onSubmit = handleSubmit(async (data) => {
    // chuyển đổi dữ liệu phù hợp với API payload
    const payload = {
      staffId,
      ...data,
      duration: Number(data.duration),
      // ... map các field khác
    };

    if (isEditMode && contractId) {
      await updateMutation.mutateAsync({ id: contractId, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  });

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
              <Form
                onSubmit={() => onSubmit()}
                className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full"
              >
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
                <div className="absolute bottom-0 bg-white p-4 w-full left-0 flex justify-end gap-2 z-10">
                  <BtnCancel isDisabled={isSubmitting} onPress={onClose} />
                  <Button
                    type="submit"
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
