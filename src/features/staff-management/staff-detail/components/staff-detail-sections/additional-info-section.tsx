import { NAMESPACES } from "@/i18n/constants";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "./section-header";
import { FormInput } from "@/components/form-fields/form-input";
import { FormArea } from "@/components/form-fields/form-area";
import { icons } from "@/lib/icons";

export const AdditionalInfoSection = () => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { control } = useFormContext();

    return (
        <div className="space-y-6">
            {/* 3. Thông tin bổ sung (Tài chính) */}
            <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                <SectionHeader icon={icons.fileText} title={t('staffForm.sections.additional')} />
                <div className="grid grid-cols-2 gap-4">
                    <FormInput control={control} name="taxCode" label={t('staffForm.fields.taxCode.label')} placeholder={t('staffForm.fields.taxCode.placeholder')} />
                    <FormInput control={control} name="insuranceNumber" label={t('staffForm.fields.insuranceNumber.label')} placeholder={t('staffForm.fields.insuranceNumber.placeholder')} />
                    <FormInput control={control} name="accountNumber" label={t('staffForm.fields.accountNumber.label')} placeholder={t('staffForm.fields.accountNumber.placeholder')} />
                    <FormInput control={control} name="beneficiaryName" label={t('staffForm.fields.beneficiaryName.label')} placeholder={t('staffForm.fields.beneficiaryName.placeholder')} />
                    <div className="col-span-2">
                        <FormInput control={control} name="bankName" label={t('staffForm.fields.bankName.label')} placeholder={t('staffForm.fields.bankName.placeholder')} />
                    </div>
                </div>
            </div>
        </div>
    );
};