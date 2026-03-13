import { FormInput } from "@/components/form-fields/form-input";
import { SectionHeader } from "./section-header";
import { FormDatePicker } from "@/components/form-fields/form-date-picker";
import { FormSelect } from "@/components/form-fields/form-select";
import { icons } from "@/lib/icons";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "@/i18n/constants";
import { useFormContext } from "react-hook-form";

export const PersonnelInfoSection = () => {
    const { control } = useFormContext();
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT)

    return (
        <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
            <SectionHeader icon={icons.circleUser} title={t('staffForm.sections.personnel')} />
            <div className="grid grid-cols-2 gap-4">
                <FormInput control={control} name="code" label={t('staffForm.fields.code.label')} placeholder={t('staffForm.fields.code.placeholder')} isRequired />
                <FormInput control={control} name="name" label={t('staffForm.fields.name.label')} placeholder={t('staffForm.fields.name.placeholder')} isRequired />
                <FormDatePicker control={control} name="birthday" label={t('staffForm.fields.birthday.label')} isRequired />
                <FormSelect
                    control={control}
                    name="gender"
                    label={t('staffForm.fields.gender.label')}
                    isRequired
                    options={[
                        { key: "MALE", label: t('staffForm.fields.gender.options.male') },
                        { key: "FEMALE", label: t('staffForm.fields.gender.options.female') },
                        { key: "OTHER", label: t('staffForm.fields.gender.options.other') }
                    ]}
                />
                <FormInput control={control} name="identity" label={t('staffForm.fields.identity.label')} placeholder={t('staffForm.fields.identity.placeholder')} />
                <FormDatePicker control={control} name="identityIssueDate" label={t('staffForm.fields.identityIssueDate.label')} />
                <FormInput control={control} name="identityIssuePlace" label={t('staffForm.fields.identityIssuePlace.label')} placeholder={t('staffForm.fields.identityIssuePlace.placeholder')} />
                <FormSelect
                    control={control}
                    name="nationality"
                    label={t('staffForm.fields.nationality.label')}
                    options={[{ key: "VN", label: t('staffForm.fields.nationality.options.vietnam') }, { key: "OTHER", label: t('staffForm.fields.nationality.options.other') }]}
                />
                <div className="col-span-2">
                    <FormInput control={control} name="address" label={t('staffForm.fields.address.label')} placeholder={t('staffForm.fields.address.placeholder')} />
                </div>
            </div>
        </div>
    )
};