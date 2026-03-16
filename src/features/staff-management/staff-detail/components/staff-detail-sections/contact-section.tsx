import { useTranslation } from "react-i18next";
import { SectionHeader } from "./section-header";
import { useFormContext } from "react-hook-form";
import { NAMESPACES } from "@/i18n/constants";
import { FormInput } from "@/components/form-fields/form-input";
import { icons } from "@/lib/icons";
import { ControlMode, useControlMode } from "@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle";
import { STAFF_SECTION_KEYS } from "../../constants/data";
import { useUpdateStaff } from "@/query-options/staff";

export const ContactSection = () => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { control, trigger, getValues } = useFormContext();
    const { data, setMode } = useControlMode();

    // Mutation để cập nhật dữ liệu
    const { mutateAsync: updateStaff, isPending: isUpdating } = useUpdateStaff();

    const isEditing = data === STAFF_SECTION_KEYS.CONTACT || data === "ALL";
    const isView = !isEditing;
    const variant = isView ? "underlined" : "flat";

    // Danh sách các fields cần quản lý trong section này
    const sectionFields: any[] = [
        "phone",
        "email",
        "emergencyContact",
        "emergencyContactPhone",
        "emergencyContactAddress",
        "emergencyContactRelationship"
    ];

    const handleSave = async () => {
        // 1. Validate riêng các field liên lạc
        const isValid = await trigger(sectionFields);

        if (isValid) {
            const values = getValues();
            // 2. Trích xuất payload
            const payload = sectionFields.reduce((obj, key) => {
                obj[key] = values[key];
                return obj;
            }, {} as any);

            try {
                // 3. Gọi API cập nhật
                await updateStaff({
                    id: values.id,
                    data: payload
                });

                // 4. Thoát mode chỉnh sửa
                if (data !== "ALL") {
                    setMode(ControlMode.view, null);
                }
            } catch (error) {
                console.error("Update Contact Info Failed:", error);
            }
        }
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
            <SectionHeader
                icon={icons.userIdentify}
                title={t('staffForm.sections.contact')}
                sectionKey={STAFF_SECTION_KEYS.CONTACT}
                onSave={handleSave}
            />
            <div className="space-y-4">
                <p className="text-xs font-semibold text-[#71717A] uppercase">
                    {t('staffForm.sections.personalContact')}
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        control={control}
                        name="phone"
                        label={t('staffForm.fields.phone.label')}
                        placeholder={t('staffForm.fields.phone.placeholder')}
                        isRequired
                        readOnly={isView}
                        variant={variant}
                    />
                    <FormInput
                        control={control}
                        name="email"
                        label={t('staffForm.fields.email.label')}
                        placeholder={t('staffForm.fields.email.placeholder')}
                        isRequired
                        readOnly={isView}
                        variant={variant}
                    />
                </div>

                <p className="text-xs font-semibold text-[#71717A] uppercase pt-4">
                    {t('staffForm.sections.emergencyContact')}
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        control={control}
                        name="emergencyContact"
                        label={t('staffForm.fields.emergencyContactName.label')}
                        placeholder={t('staffForm.fields.emergencyContactName.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                    <FormInput
                        control={control}
                        name="emergencyContactPhone"
                        label={t('staffForm.fields.emergencyContactPhone.label')}
                        placeholder={t('staffForm.fields.emergencyContactPhone.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                    <FormInput
                        control={control}
                        name="emergencyContactAddress"
                        label={t('staffForm.fields.emergencyContactAddress.label')}
                        placeholder={t('staffForm.fields.emergencyContactAddress.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                    <FormInput
                        control={control}
                        name="emergencyContactRelationship"
                        label={t('staffForm.fields.emergencyContactRelationship.label')}
                        placeholder={t('staffForm.fields.emergencyContactRelationship.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                </div>
            </div>
        </div>
    );
};