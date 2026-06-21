import { useMemo } from 'react';
import { Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { FormProvider, useForm } from 'react-hook-form';
import { useContractDetail } from '@/query-options/staff-contract';
import { getContractDefaultValues } from '../hooks/use-contract-form';
import { ContractInfoSection } from './contract-and-salary-sections/contract-info-section';
import { SalaryStructureSection } from './contract-and-salary-sections/salary-structure-section';
import { SalaryInfoSection } from './contract-and-salary-sections/salary-info-section';
import { InsuranceAndUnionSection } from './contract-and-salary-sections/insurance-and-union-section';
import { PersonalIncomeTaxSection } from './contract-and-salary-sections/personal-income-tax-section';

import { NAMESPACES } from '@/i18n/constants';
import { IconHistory } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { DataTable } from '@/components/data-table/data-table';
import { useStaffContracts } from '@/query-options/staff-contract';

import { useWorkHistoryColumns, type WorkHistoryRow } from '../hooks/use-work-history-columns';
import { icons } from '@/lib/icons';

interface WorkHistoryTableProps {
  staffId: string;
}

export const WorkHistoryTable = ({ staffId }: WorkHistoryTableProps) => {
  const { t, i18n } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
  const { data: response } = useStaffContracts(staffId);
  const contracts = response?.data || [];

  const { columns, viewContractId, setViewContractId } = useWorkHistoryColumns(staffId);

  const dataSource = useMemo<WorkHistoryRow[]>(
    () =>
      contracts
        .flatMap((c) =>
          (c.staffWorkHistory || []).map((wh) => ({
            ...wh,
            _contractId: c.id,
            _staffCode: c.staff?.code,
            _staffName: c.staff?.name,
            _departmentName: c.department?.name,
            departments: c.departments,
            rooms: c.rooms,
          })),
        )
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()),
    [contracts, i18n.language],
  );
  return (
    <>
    <div className="bg-white rounded-xl shadow-2xl">
      <div className="flex items-center gap-2 px-6 pt-3 pb-0 text-[#11181C] fill-black">
        {icons.alarm}
        <h3 className="text-[16px] font-bold text-[#11181C]">{t('work_history.title')}</h3>
      </div>

      <DataTable
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        selectionMode="none"
        emptyContent={t('work_history.empty')}
      />
    </div>

    <Modal isOpen={!!viewContractId} onClose={() => setViewContractId(null)} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="text-xl font-bold border-b border-[#F4F4F5] pb-4">
          Chi tiết hợp đồng
        </ModalHeader>
        <ModalBody className="pb-6">
          {viewContractId && <ContractDetailView contractId={viewContractId} />}
        </ModalBody>
      </ModalContent>
    </Modal>
    </>
  );
};

const ContractDetailView = ({ contractId }: { contractId: string }) => {
  const { data, isLoading } = useContractDetail(contractId);
  const methods = useForm({ defaultValues: getContractDefaultValues(undefined as any) });

  useMemo(() => {
    if (data?.data) methods.reset(getContractDefaultValues(data.data));
  }, [data]);

  if (isLoading) return <div className="py-10 text-center text-[#71717A]">Đang tải...</div>;

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 p-2">
        <div className="flex flex-col gap-4">
          <ContractInfoSection />
          <InsuranceAndUnionSection />
        </div>
        <div className="flex flex-col gap-4">
          <SalaryStructureSection />
          <SalaryInfoSection />
          <PersonalIncomeTaxSection />
        </div>
      </div>
    </FormProvider>
  );
};