import { useTranslation } from "react-i18next";
import { SectionHeader } from "./section-header";
import { useFormContext } from "react-hook-form";
import { NAMESPACES } from "@/i18n/constants";
import { FormInput } from "@/components/form-fields/form-input";
import { icons } from "@/lib/icons";

export const ContactSection = () => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { control } = useFormContext();

    return (
        <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
            <SectionHeader icon={icons.userIdentify} title={t('staffForm.sections.contact')} />
            <div className="space-y-4">
                <p className="text-xs font-semibold text-[#71717A] uppercase">{t('staffForm.sections.personalContact')}</p>
                <div className="grid grid-cols-2 gap-4">
                    <FormInput control={control} name="phone" label={t('staffForm.fields.phone.label')} placeholder={t('staffForm.fields.phone.placeholder')} isRequired />
                    <FormInput control={control} name="email" label={t('staffForm.fields.email.label')} placeholder={t('staffForm.fields.email.placeholder')} isRequired />
                </div>

                <p className="text-xs font-semibold text-[#71717A] uppercase pt-4">{t('staffForm.sections.emergencyContact')}</p>
                <div className="grid grid-cols-2 gap-4">
                    <FormInput control={control} name="emergencyContact" label={t('staffForm.fields.emergencyContactName.label')} placeholder={t('staffForm.fields.emergencyContactName.placeholder')} />
                    <FormInput control={control} name="emergencyContactPhone" label={t('staffForm.fields.emergencyContactPhone.label')} placeholder={t('staffForm.fields.emergencyContactPhone.placeholder')} />
                    <FormInput control={control} name="emergencyContactAddress" label={t('staffForm.fields.emergencyContactAddress.label')} placeholder={t('staffForm.fields.emergencyContactAddress.placeholder')} />
                    <FormInput control={control} name="emergencyContactRelationship" label={t('staffForm.fields.emergencyContactRelationship.label')} placeholder={t('staffForm.fields.emergencyContactRelationship.placeholder')} />
                </div>
            </div>
        </div>
    );
};