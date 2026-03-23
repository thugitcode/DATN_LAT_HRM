import { NAMESPACES } from "@/i18n/constants";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { Chip } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { RevenueStatus } from "../../types/revenue.type";

export const StatusChip = ({ status }: { status: RevenueStatus }) => {
    const isApproved = status === RevenueStatus.CONFIRMED
    const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT)

    return (
        <Chip
            size="md"
            variant="flat"
            color={isApproved ? 'success' : 'warning'}
            classNames={{
                base: 'h-8 w-[116px] px-2',
                content: cn(!isApproved && "text-[#F5A524]", 'text-sm font-medium flex-1 text-center'),
            }}
            startContent={
                isApproved ? (
                    <icons.tickCircle width={17} height={17} />
                ) : (
                    <span className="text-[#F5A524]!">{icons.peinding}</span>
                )
            }
        >
            {isApproved ? t('revenue.status.approved') : t('revenue.status.pending')}
        </Chip>
    );
}