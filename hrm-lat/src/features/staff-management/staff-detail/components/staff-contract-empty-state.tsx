import { Button, Card, CardBody } from "@heroui/react";
import { IconAlertCircle, IconPlus } from "@tabler/icons-react";
import { DrawerType, useDrawer } from "@/store/useDrawer";
import { ControlMode, useControlMode } from "../../salary-and-benefits/hooks/use-control-mode-handle";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "@/i18n/constants";

interface StaffContractEmptyStateProps {
    staffId: string;
}

export default function StaffContractEmptyState({
    staffId,
}: StaffContractEmptyStateProps) {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const onOpenDrawer = useDrawer((state) => state.onOpen);
    const { setMode, isReadOnly } = useControlMode();

    const handleAddNew = () => {
        setMode(ControlMode.create);
        onOpenDrawer(DrawerType.STAFF_CONTRACT_MUTATE, { staffId });
    };

    return (
        <div className="space-y-6 mt-4">
                <Card className="shadow-none border border-[#F4F4F5] rounded-2xl overflow-hidden bg-white">
                    <CardBody className="flex flex-col items-center justify-center py-16 gap-4">
                        <IconAlertCircle size={48} className="text-[#A1A1AA]" />

                        <p className="text-[15px] text-[#71717A] text-center max-w-md">
                            {t('contract_info.empty_description')}
                        </p>

                        {!isReadOnly && (
                            <Button
                                color="primary"
                                size="sm"
                                startContent={<IconPlus size={18} />}
                                className="bg-[#6576FF] text-white font-semibold h-9 rounded-xl px-6 min-w-[180px]"
                                onPress={handleAddNew}
                            >
                                {t('contract_info.add_contract')}
                            </Button>
                        )}
                    </CardBody>
                </Card>

        </div>
    );
}