import { Button, Card, CardBody, useDisclosure } from "@heroui/react";
import { IconAlertCircle, IconPlus } from "@tabler/icons-react";
import { useState } from "react";
import { StaffContractFormDrawer } from "./staff-contract-form-drawer";
import { ControlMode, useControlMode } from "../../salary-and-benefits/hooks/use-control-mode-handle";

interface StaffContractEmptyStateProps {
    staffId: string;
}

export default function StaffContractEmptyState({
    staffId,
}: StaffContractEmptyStateProps) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedContractId, setSelectedContractId] = useState<string | undefined>(undefined);
    const { setMode } = useControlMode()
    const handleCloseDrawer = () => {
        setSelectedContractId(undefined);
        onClose();
    };

    const handleAddNew = () => {
        setMode(ControlMode.create)
        setSelectedContractId(undefined);
        onOpen();
    };

    return (
        <>
            <div className="space-y-6 mt-4">
                <Card className="shadow-none border border-[#F4F4F5] rounded-2xl overflow-hidden bg-white">
                    <CardBody className="flex flex-col items-center justify-center py-16 gap-4">
                        <IconAlertCircle size={48} className="text-[#A1A1AA]" />

                        <p className="text-[15px] text-[#71717A] text-center max-w-md">
                            Nhân viên chưa có dữ liệu hợp đồng, vui lòng thêm mới hợp đồng.
                        </p>

                        <Button
                            color="primary"
                            size="sm"
                            startContent={<IconPlus size={18} />}
                            className="bg-[#006FEE] text-white font-semibold h-9 rounded-xl px-6 min-w-[180px]"
                            onPress={handleAddNew}
                        >
                            Thêm mới hợp đồng
                        </Button>
                    </CardBody>
                </Card>

                {/* Drawer form thêm/sửa hợp đồng */}
                <StaffContractFormDrawer
                    isOpen={isOpen}
                    onClose={handleCloseDrawer}
                    staffId={staffId}
                    contractId={selectedContractId}
                />
            </div>
        </>
    );
}