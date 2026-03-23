import { BtnCancel } from "@/components/btn-cancel";
import { BtnSave } from "@/components/btn-save";
import { ControlMode, useControlMode } from "@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle";
import { icons } from "@/lib/icons";
import { Button } from "@heroui/react";
import type { StaffSectionKey } from "../../types";

export const SectionHeader = ({ icon: Icon, title, onSave, sectionKey }: { icon: any, title: string, onSave?: () => {}, sectionKey: StaffSectionKey }) => {
    const { setMode, data } = useControlMode()

    return (
        <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
                {Icon}
                <h3 className="font-semibold text-sm text-[#11181C] uppercase tracking-wider">{title}</h3>
            </div>
            {sectionKey !== data && data !== "ALL" &&
                <Button
                    isIconOnly
                    variant="bordered"
                    onPress={() => setMode(ControlMode.edit, sectionKey)}>
                    <icons.edit className="size-5" />
                </Button>}
            {data && sectionKey === data && data !== "ALL" && <div className="flex gap-2">
                <BtnCancel
                    onPress={() => setMode(ControlMode.view, null)}
                />
                <BtnSave type="button" onPress={onSave} />
            </div>
            }
        </div>
    )
};