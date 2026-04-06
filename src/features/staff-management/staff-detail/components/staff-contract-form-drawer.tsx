import { useDrawer } from '@/store/useDrawer';
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
import { LoadingWrapper } from '@/components/loading-wrapper';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

interface StaffContractDrawerData {
  staffId: string;
  contractId?: string;
}

export const StaffContractFormDrawer = () => {
  const onClose = useDrawer((state) => state.onClose);
  const drawerData = useDrawer((state) => state.data) as StaffContractDrawerData;
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT)
  const { staffId, contractId } = drawerData ?? {};

  const { methods, isEditMode, isDetailLoading, isSubmitting, onSubmit } = useContractForm({
    isOpen: true,
    onClose,
    staffId,
    contractId,
  });

  return (
    <div className="relative h-full overflow-hidden bg-[#FAFAFA]">
      <div className="px-6 py-5 bg-white border-b border-[#F4F4F5]">
        <h2 className="text-3xl font-bold text-[#11181C]">
          {isEditMode ? t('contract_info.edit_contract') : t('contract_info.add_contract')}
        </h2>
      </div>
      <LoadingWrapper isLoading={isDetailLoading}>
        <FormProvider {...methods}>
          <Form
            onSubmit={() => onSubmit()}
            className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full overflow-y-auto p-6 h-[calc(100vh-150px)]"
          >
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
      </LoadingWrapper>
    </div>
  );
};
