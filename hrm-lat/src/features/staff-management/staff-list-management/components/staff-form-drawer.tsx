import { Button } from "@heroui/react";
import { Form, FormProvider } from "react-hook-form";
import { BtnCancel } from "@/components/btn-cancel";
import { LoadingWrapper } from "@/components/loading-wrapper";
import { NAMESPACES } from "@/i18n/constants";
import { useDrawer } from "@/store/useDrawer";
import type { Staff } from "@/types/staff.type";
import { useTranslation } from "react-i18next";
import { AdditionalInfoSection } from "../../staff-detail/components/staff-detail-sections/additional-info-section";
import { AvatarSection } from "../../staff-detail/components/staff-detail-sections/avatar-section";
import { ContactSection } from "../../staff-detail/components/staff-detail-sections/contact-section";
import { DepartmentSection } from "../../staff-detail/components/staff-detail-sections/department-section";
import { PersonnelInfoSection } from "../../staff-detail/components/staff-detail-sections/personnel-info-section";
import { QualificationSection } from "../../staff-detail/components/staff-detail-sections/qualification-section";
import { useStaffForm } from "../../staff-detail/hooks/use-staff-form";
import { useEffect } from "react";
import { ControlMode, useControlMode } from "../../salary-and-benefits/hooks/use-control-mode-handle";

export const StaffFormDrawer = () => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { t: tc } = useTranslation(NAMESPACES.COMMON);
    const onClose = useDrawer((state) => state.onClose);
    const editData = useDrawer((state) => state.data) as Staff | undefined;

    const { form, onSubmit, isEdit } = useStaffForm(true, editData, onClose);
    const { setMode } = useControlMode()
    useEffect(() => {
        setMode(ControlMode.create, "ALL")
    }, [])
    return (
        <div className="relative h-full overflow-hidden bg-[#F4F4F5]">
            <div className="px-6 py-5 bg-white border-b border-[#E4E4E7]">
                <h2 className="text-3xl font-bold">
                    {isEdit ? t("staffForm.editTitle") : t("staffForm.addTitle")}
                </h2>
            </div>
            <LoadingWrapper isLoading={form.formState.isSubmitting}>
                <FormProvider {...form}>
                    <Form
                        id="staff-form"
                        onSubmit={() => onSubmit()}
                        className="p-6 grid grid-cols-12 gap-3.75 overflow-auto h-[calc(100vh-150px)]"
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
            </LoadingWrapper>
            <div className="absolute bottom-0 bg-white p-4 w-full left-0 flex justify-end gap-2 z-10 border-t border-[#E4E4E7]">
                <BtnCancel isDisabled={form.formState.isSubmitting} onPress={onClose} />
                <Button
                    color="primary"
                    type="submit"
                    form="staff-form"
                    isLoading={form.formState.isSubmitting}
                    className="font-medium rounded-xl"
                >
                    {tc("button.save")}
                </Button>
            </div>
        </div>
    );
};
