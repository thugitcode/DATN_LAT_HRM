import { useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useStaffDetail, useUpdateStaff } from '@/query-options/staff';
import { Button, Tab, Tabs } from '@heroui/react';
import { Form, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';
import { BtnCancel } from '@/components/btn-cancel';
import { BtnSave } from '@/components/btn-save';
import { PageContainer } from '@/components/page-container';

import { StaffProfile } from '../profile-staff/staff-profile';
import { ControlMode, useControlMode } from '../salary-and-benefits/hooks/use-control-mode-handle';
import { SalaryAndBenefits } from '../salary-and-benefits/salary-and-benefits';
import { TimeAttendanceManagementTab } from '../time-attendance-management/time-attendance-management-tab';
import { StaffContractInfo, StaffDetailHeader } from './components';
import { StaffDetailInfo } from './components/staff-detail-info';
import { useStaffDetailTabs } from './hooks/use-staff-detail-tabs';
import { useStaffForm } from './hooks/use-staff-form';
import { TAB_KEYS } from './types';

interface StaffDetailProps {
  id: string;
}

export const StaffDetail = ({ id }: StaffDetailProps) => {
  const { data: response, isLoading } = useStaffDetail(id);
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { setMode } = useControlMode();
  const { form, onSubmit } = useStaffForm(true, response?.data, () => {});
  const updateStaffMutation = useUpdateStaff();
  const staff = response?.data;
  const [isEditingAll, setIsEditingAll] = useState(false);
  const { activeKey, onSelectionChange } = useStaffDetailTabs();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F8F9FA]">
        <div className="w-10 h-10 border-4 border-[#006FEE] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="flex h-full items-center justify-center bg-[#F8F9FA]">
        <p className="text-[#71717A]">Không tìm thấy thông tin nhân viên</p>
      </div>
    );
  }

  const handleCancelAll = () => {
    setIsEditingAll(false);
    setMode(ControlMode.view, null);
  };

  return (
    <PageContainer className="p-6 bg-[#F8F9FA] min-h-full space-y-4">
      <StaffDetailHeader staff={staff} />

      <div className="w-full">
        <Tabs
          variant="underlined"
          aria-label={t('staffDetail.tabs.info')}
          selectedKey={activeKey}
          onSelectionChange={(key) => onSelectionChange(key as TAB_KEYS)}
          classNames={{
            cursor: 'bg-blue-500 h-[2px]',
            tabContent: 'text-gray-500 group-data-[selected=true]:text-primary!',
          }}
        >
          <Tab key={TAB_KEYS.INFO} title={t('staffDetail.tabs.info')}>
            <FormProvider {...form}>
              <Form id="staff-detail-form" onSubmit={() => onSubmit()}>
                <div className="flex items-center justify-between mt-0.75 mb-3.75">
                  <h2 className="text-2xl font-medium text-[#11181C]">
                    {t('staffDetail.infoTab.title')}
                  </h2>
                  <div className="flex items-center gap-2">
                    {isEditingAll ? (
                      <>
                        <BtnCancel
                          onPress={handleCancelAll}
                          isDisabled={updateStaffMutation.isPending}
                        />
                        <BtnSave
                          type="submit"
                          form="staff-detail-form"
                          // onPress={handleSaveAll}
                          isLoading={updateStaffMutation.isPending}
                        />
                      </>
                    ) : (
                      <Button
                        variant="bordered"
                        className="border-primary text-primary font-semibold rounded-xl px-4"
                        startContent={<icons.edit stroke="#006FEE" className="size-5" />}
                        onPress={() => {
                          setIsEditingAll(true);
                          setMode(ControlMode.edit, 'ALL');
                        }}
                      >
                        {t('staffDetail.infoTab.buttons.edit')}
                      </Button>
                    )}
                  </div>
                </div>
                <div className="overflow-auto h-[calc(100vh-310px)]">
                  <StaffDetailInfo />
                </div>
              </Form>
            </FormProvider>
          </Tab>
          <Tab key={TAB_KEYS.CONTRACT} title={t('staffDetail.tabs.contract')}>
            <StaffContractInfo staffId={id} />
          </Tab>
          <Tab key={TAB_KEYS.SALARY} title={t('staffDetail.tabs.salary')}>
            <SalaryAndBenefits />
          </Tab>
          <Tab key={TAB_KEYS.ATTENDANCE} title={t('staffDetail.tabs.attendance')}>
            <TimeAttendanceManagementTab />
          </Tab>
          <Tab key={TAB_KEYS.DOCUMENTS} title={t('staffDetail.tabs.documents')}>
            <StaffProfile />
          </Tab>
        </Tabs>
      </div>
    </PageContainer>
  );
};
