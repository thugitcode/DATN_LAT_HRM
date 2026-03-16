import { FormInput } from "@/components/form-fields/form-input";
import { SectionHeader } from "./section-header";
import { FormDatePicker } from "@/components/form-fields/form-date-picker";
import { FormSelect } from "@/components/form-fields/form-select";
import { icons } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "@/i18n/constants";
import { useFormContext } from "react-hook-form";
import { ControlMode, useControlMode } from "@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle";
import { STAFF_SECTION_KEYS } from "../../constants/data";
import { useUpdateStaff } from "@/query-options/staff";

export const PersonnelInfoSection = () => {
    const { control, trigger, getValues } = useFormContext();
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { data, setMode, isCreate, mode } = useControlMode(); // Giả sử setControlMode để thoát chế độ edit
    const { mutateAsync: updateStaff, isPending: isUpdating } = useUpdateStaff();
    
    // Logic xác định mode
    const isEditing = data === STAFF_SECTION_KEYS.PERSONNEL || data === "ALL";
    const isView = !isEditing;
    const variant = isView ? "underlined" : "flat";

    // Danh sách các field thuộc section này để validate
    const sectionFields: any[] = [
        "code", "name", "birthday", "gender",
        "identity", "identityIssueDate", "identityIssuePlace",
        "nationality", "address"
    ];

    const handleSave = async () => {
        const isValid = await trigger(sectionFields);

        if (isValid) {
            const values = getValues(sectionFields);

            const payload = sectionFields.reduce((obj, key) => {
                obj[key] = values[sectionFields.indexOf(key)];
                return obj;
            }, {} as any);

            console.log("Submit Section Personnel:", payload);
            await updateStaff({ id: getValues().id, data: payload as any });

            if (data !== "ALL") setMode(ControlMode.view, null);
        }
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
            <SectionHeader icon={icons.circleUser} title={t('staffForm.sections.personnel')} sectionKey={STAFF_SECTION_KEYS.PERSONNEL} onSave={handleSave} />
            <div className="grid grid-cols-2 gap-4">
                <FormInput control={control} name="code" label={t('staffForm.fields.code.label')} placeholder={t('staffForm.fields.code.placeholder')} readOnly={!isCreate} variant={variant} />
                <FormInput control={control} name="name" label={t('staffForm.fields.name.label')} placeholder={t('staffForm.fields.name.placeholder')} isRequired readOnly={isView} variant={variant} />
                <FormDatePicker control={control} name="birthday" label={t('staffForm.fields.birthday.label')} isRequired isReadOnly={isView} variant={variant} />
                <FormSelect
                    control={control}
                    name="gender"
                    label={t('staffForm.fields.gender.label')}
                    isRequired
                    disabled={isView}
                    variant={variant}
                    options={[
                        { key: "MALE", label: t('staffForm.fields.gender.options.male') },
                        { key: "FEMALE", label: t('staffForm.fields.gender.options.female') },
                        { key: "OTHER", label: t('staffForm.fields.gender.options.other') }
                    ]}
                />
                <FormInput control={control} name="identity" label={t('staffForm.fields.identity.label')} placeholder={t('staffForm.fields.identity.placeholder')} readOnly={isView} variant={variant} />
                <FormDatePicker control={control} name="identityIssueDate" label={t('staffForm.fields.identityIssueDate.label')} isReadOnly={isView} variant={variant} />
                <FormInput control={control} name="identityIssuePlace" label={t('staffForm.fields.identityIssuePlace.label')} placeholder={t('staffForm.fields.identityIssuePlace.placeholder')} readOnly={isView} variant={variant} />
                <FormSelect
                    control={control}
                    name="nationality"
                    label={t('staffForm.fields.nationality.label')}
                    disabled={isView}
                    variant={variant}
                    options={[{ key: "VN", label: t('staffForm.fields.nationality.options.vietnam') }, { key: "OTHER", label: t('staffForm.fields.nationality.options.other') }]}
                />
                <div className="col-span-2">
                    <FormInput control={control} name="address" label={t('staffForm.fields.address.label')} placeholder={t('staffForm.fields.address.placeholder')} readOnly={isView} variant={variant} />
                </div>
            </div>
        </div>
    );
};