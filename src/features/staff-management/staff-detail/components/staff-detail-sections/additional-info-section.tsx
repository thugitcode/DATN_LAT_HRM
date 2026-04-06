import { FormInput } from "@/components/form-fields/form-input";
import { NAMESPACES } from "@/i18n/constants";
import { icons } from "@/lib/icons";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "./section-header";
import { ControlMode, useControlMode } from "@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle";
import { STAFF_SECTION_KEYS } from "../../constants/data";
import { useUpdateStaff } from "@/query-options/staff";

export const AdditionalInfoSection = () => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { control, trigger, getValues } = useFormContext();
    const { data, setMode, isView: view } = useControlMode();

    // Logic mutation cập nhật nhân viên
    const { mutateAsync: updateStaff, isPending: isUpdating } = useUpdateStaff();

    const isEditing = data === STAFF_SECTION_KEYS.ADDITIONAL || data === "ALL";
    const isView = !isEditing || view;
    const variant = isView ? "underlined" : "flat";

    // Danh sách các fields thuộc section này
    const sectionFields: any[] = [
        "taxCode",
        "healthInsuranceNumber",
        "insuranceNumber",
        "accountNumber",
        "beneficiaryName",
        "bankName"
    ];

    const handleSave = async () => {
        // 1. Chỉ validate các trường trong section này
        const isValid = await trigger(sectionFields);

        if (isValid) {
            // 2. Lấy dữ liệu hiện tại của các trường này
            const values = getValues();
            const payload = sectionFields.reduce((obj, key) => {
                obj[key] = values[key];
                return obj;
            }, {} as any);

            try {
                // 3. Gọi API update (giả sử id nhân viên nằm trong form hoặc từ route)
                await updateStaff({
                    id: values.id,
                    data: payload
                });

                // 4. Thoát chế độ edit nếu không phải đang ở mode "Edit All"
                if (data !== "ALL") {
                    setMode(ControlMode.view, null);
                }
            } catch (error) {
                console.error("Update Additional Info Failed:", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                <SectionHeader
                    icon={icons.fileText}
                    title={t('staffForm.sections.additional')}
                    sectionKey={STAFF_SECTION_KEYS.ADDITIONAL}
                    onSave={handleSave}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormInput
                        control={control}
                        name="taxCode"
                        label={t('staffForm.fields.taxCode.label')}
                        placeholder={t('staffForm.fields.taxCode.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                    <FormInput
                        control={control}
                        name="healthInsuranceNumber"
                        label={t('staffForm.fields.healthInsuranceNumber.label')}
                        placeholder={t('staffForm.fields.healthInsuranceNumber.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                    <FormInput
                        control={control}
                        name="insuranceNumber"
                        label={t('staffForm.fields.insuranceNumber.label')}
                        placeholder={t('staffForm.fields.insuranceNumber.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                    <FormInput
                        control={control}
                        name="accountNumber"
                        label={t('staffForm.fields.accountNumber.label')}
                        placeholder={t('staffForm.fields.accountNumber.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                    <FormInput
                        control={control}
                        name="beneficiaryName"
                        label={t('staffForm.fields.beneficiaryName.label')}
                        placeholder={t('staffForm.fields.beneficiaryName.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                    <FormInput
                        control={control}
                        name="bankName"
                        label={t('staffForm.fields.bankName.label')}
                        placeholder={t('staffForm.fields.bankName.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                </div>
            </div>
        </div>
    );
};