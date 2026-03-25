// staff-contract-form-drawer.tsx
import type { FC } from 'react';
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
} from '@heroui/react';
import { Form, FormProvider } from 'react-hook-form';

import { BtnCancel } from '@/components/btn-cancel';
import { BtnSave } from '@/components/btn-save';

import { useContractForm } from '../hooks/use-contract-form';
import { ContractInfoSection } from './contract-and-salary-sections/contract-info-section';
import { InsuranceAndUnionSection } from './contract-and-salary-sections/insurance-and-union-section';
import { LeaveBenefitsSection } from './contract-and-salary-sections/leave-benefits-section';
import { PersonalIncomeTaxSection } from './contract-and-salary-sections/personal-income-tax-section';
import { SalaryInfoSection } from './contract-and-salary-sections/salary-info-section';
import { SalaryStructureSection } from './contract-and-salary-sections/salary-structure-section';

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
  const { methods, isEditMode, isDetailLoading, isSubmitting, onSubmit } =
    useContractForm({ isOpen, onClose, staffId, contractId });

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={(open) => !open && onClose()}
      size="full"
      placement="right"
      classNames={{ base: 'bg-[#FAFAFA]' }}
      style={{ width: '97vw', maxWidth: '97vw' }}
    >
      <DrawerContent>
        <DrawerHeader className="...">
          <h2 className="text-3xl font-bold text-[#11181C]">
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
                className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full pb-18 max-md:pb-28"
              >
                {/* Bắt đầu với phần Thông tin hợp đồng */}
                <div className="flex flex-col gap-6">
                  <ContractInfoSection />
                  <InsuranceAndUnionSection />
                </div>

                <div className="flex flex-col gap-6">
                  <SalaryStructureSection />
                  <SalaryInfoSection />
                  <LeaveBenefitsSection />
                  <PersonalIncomeTaxSection />
                </div>
                <div className="absolute bottom-0 bg-white p-4 w-full left-0 flex justify-end gap-2 z-10">
                  <BtnCancel isDisabled={isSubmitting} onPress={onClose} />
                  <BtnSave isLoading={isSubmitting} />
                </div>
              </Form>
            </FormProvider>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
