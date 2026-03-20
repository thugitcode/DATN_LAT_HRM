import {
    Button,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerFooter,
    DrawerHeader
} from "@heroui/react";
import { Form, FormProvider } from "react-hook-form";
// Enum imports removed as they are now used via strings or not at all in this component's logic
import { BtnCancel } from "@/components/btn-cancel";
import { NAMESPACES } from "@/i18n/constants";
import type { Staff } from "@/types/staff.type";
import { useTranslation } from "react-i18next";
import { AdditionalInfoSection } from "../../staff-detail/components/staff-detail-sections/additional-info-section";
import { AvatarSection } from "../../staff-detail/components/staff-detail-sections/avatar-section";
import { ContactSection } from "../../staff-detail/components/staff-detail-sections/contact-section";
import { DepartmentSection } from "../../staff-detail/components/staff-detail-sections/department-section";
import { PersonnelInfoSection } from "../../staff-detail/components/staff-detail-sections/personnel-info-section";
import { QualificationSection } from "../../staff-detail/components/staff-detail-sections/qualification-section";
import { useStaffForm } from "../../staff-detail/hooks/use-staff-form";
import { ControlMode, useControlMode } from "../../salary-and-benefits/hooks/use-control-mode-handle";
import { useEffect } from "react";

interface StaffFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    editData?: Staff;
}

export const StaffFormDrawer = ({ isOpen, onClose, editData }: StaffFormDrawerProps) => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { t: tc } = useTranslation(NAMESPACES.COMMON);
    const { setMode } = useControlMode()
    useEffect(() => {
        setMode(ControlMode.create, "ALL")
    }, [])
    // Sử dụng hook
    const { form, onSubmit, isEdit } = useStaffForm(isOpen, editData, onClose);

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            classNames={{
                base: "bg-[#F4F4F5]",
                header: "border-b bg-white border-[#E4E4E7] py-4",
                body: "bg-[#F4F4F5] p-0",
                footer: "border-t bg-white border-[#E4E4E7] p-4 gap-3",
            }}
            isDismissable={false}
        >
            <DrawerContent>
                {(handleClose) => (
                    <>
                        <DrawerHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">
                                {isEdit ? t("staffForm.editTitle") : t("staffForm.addTitle")}
                                {/* Thêm editTitle/addTitle vào JSON nếu cần */}
                            </h2>
                        </DrawerHeader>
                        <DrawerBody className="overflow-y-auto cursor-default">
                            <FormProvider {...form}>
                                <Form
                                    id="staff-form"
                                    onSubmit={() => onSubmit()}
                                    className="p-6 grid grid-cols-12 gap-3.75"
                                >
                                    <AvatarSection />

                                    <div className="col-span-12 lg:col-span-7 space-y-6">
                                        <PersonnelInfoSection />
                                        <DepartmentSection />
                                        <AdditionalInfoSection />
                                    </div>

                                    <div className="col-span-12 lg:col-span-5 space-y-6">
                                        <ContactSection />
                                        <QualificationSection />
                                    </div>
                                </Form>
                            </FormProvider>
                        </DrawerBody>
                        <DrawerFooter>
                            <BtnCancel onPress={handleClose} />
                            <Button
                                color="primary"
                                type="submit"
                                form="staff-form"
                                // isLoading={isPending}
                                className="font-medium rounded-xl"
                            >
                                {tc("button.save")}
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
};
