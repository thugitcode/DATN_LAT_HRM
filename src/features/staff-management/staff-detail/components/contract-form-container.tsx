import { Form, FormProvider } from "react-hook-form"
import { ContractInfoSection } from "./contract-and-salary-sections/contract-info-section"
import { getContractDefaultValues, useContractForm } from "../hooks/use-contract-form";
import { TitlePage } from "@/components/title-page";
import { Button } from "@heroui/react";
import { ControlMode, useControlMode } from "../../salary-and-benefits/hooks/use-control-mode-handle";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "@/i18n/constants";
import { icons } from "@/lib/icons";
import { BtnCancel } from "@/components/btn-cancel";
import { BtnSave } from "@/components/btn-save";
import { DrawerType, useDrawer } from "@/store/useDrawer";
import { useParams } from "@tanstack/react-router";
import { useStaffContracts } from "@/query-options/staff-contract";
import { ContractStatusEnum } from "@/types/staff.type";
import { useEffect } from "react";
import { WorkHistoryTable } from "./work-history-table";
import { LoadingWrapper } from "@/components/loading-wrapper";

export const ContractFormContainer = () => {
    const { id: staffId } = useParams({ strict: false })
    const { methods, isEditMode, isDetailLoading, isSubmitting, onSubmit, reset } =
        useContractForm({ isOpen: true, onClose: () => { }, staffId: staffId ?? "", contractId: "" });

    const { data: response, isLoading } = useStaffContracts(staffId ?? "");
    const contracts = response?.data || [];
    const currentContract = contracts.find((c) => c.status === ContractStatusEnum.SIGNED) || contracts[0];

    const { onOpen } = useDrawer()
    const { mode, setMode } = useControlMode();
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT)

    useEffect(() => {
        if (!currentContract) return;
        reset(getContractDefaultValues(currentContract));
    }, [currentContract, reset]);

    const handleNewContract = () => {
        setMode(ControlMode.create)
        methods.reset()
        onOpen(DrawerType.STAFF_CONTRACT_MUTATE, { staffId: staffId ?? "", contractId: "" })
    }

    return <FormProvider {...methods}>
        <LoadingWrapper isLoading={isDetailLoading || isLoading} height="50vh">
            <Form
                onSubmit={() => onSubmit()}
                className="flex flex-col w-full gap-[15px]"
            >
                <div className="flex justify-between items-center">
                    <TitlePage title={t('contract_info.title')} />
                    <div className="flex items-center gap-[15px]">
                        {currentContract?.status !== ContractStatusEnum.SIGNED && <div>
                            {mode === ControlMode.view ? (
                                <Button
                                    variant="bordered"
                                    color="primary"
                                    startContent={<icons.edit width="20px" height="20px" stroke="#006FEE" />}
                                    onPress={() => setMode(ControlMode.edit)}
                                >
                                    {t('salary_benefits.edit')}
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <BtnCancel isDisabled={isSubmitting} onPress={() => setMode(ControlMode.view)} />
                                    <BtnSave isLoading={isSubmitting} />
                                </div>
                            )}
                        </div>}
                        <Button onPress={() => handleNewContract()} color="primary">{t('contract_info.add_contract')}</Button>
                    </div>
                </div>
                <div className="overflow-auto h-[calc(100vh-305px)] flex flex-col gap-6">
                    <ContractInfoSection />
                    <WorkHistoryTable staffId={staffId ?? ""} />
                </div>
            </Form>
        </LoadingWrapper>
    </FormProvider>
}