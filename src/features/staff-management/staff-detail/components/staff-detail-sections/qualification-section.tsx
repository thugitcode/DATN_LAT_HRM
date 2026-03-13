import { NAMESPACES } from "@/i18n/constants";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "./section-header";
import { FormSelect } from "@/components/form-fields/form-select";
import { FormInput } from "@/components/form-fields/form-input";
import { FormDatePicker } from "@/components/form-fields/form-date-picker";
import { icons } from "@/lib/icons";
import { FormArea } from "@/components/form-fields/form-area";

export const QualificationSection = () => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { control } = useFormContext();

    return (
        <>
            <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                <SectionHeader icon={icons.medalRibonStar} title={t('staffForm.sections.qualification')} />
                <div className="grid grid-cols-2 gap-4">
                    <FormSelect
                        control={control}
                        name="qualification"
                        label={t('staffForm.fields.qualification.label')}
                        isRequired
                        options={['intermediate', 'college', 'bachelor', 'master', 'doctor', 'phd', 'specialist', 'other'].map(k => ({
                            key: k.toUpperCase(),
                            label: t(`options.qualification.${k}`)
                        }))}
                    />
                    <FormInput control={control} name="major" label={t('staffForm.fields.major.label')} placeholder={t('staffForm.fields.major.placeholder')} />
                    <FormSelect
                        control={control}
                        name="academicTitles"
                        label={t('staffForm.fields.academicTitles.label')}
                        selectionMode="multiple"
                        options={['doctor', 'master', 'phd', 'spec1', 'spec2'].map(k => ({
                            key: k.toUpperCase(),
                            label: t(`options.academicTitles.${k}`)
                        }))}
                    />
                    <FormInput control={control} name="certificateNumber" label={t('staffForm.fields.certificateNumber.label')} placeholder={t('staffForm.fields.certificateNumber.placeholder')} />
                    <FormInput control={control} name="certificateIssuePlace" label={t('staffForm.fields.certificateIssuePlace.label')} placeholder={t('staffForm.fields.certificateIssuePlace.placeholder')} />
                    <FormDatePicker control={control} name="certificateExpiryDate" label={t('staffForm.fields.certificateExpiryDate.label')} />
                </div>
            </div>
            {/* 6. Ghi chú */}
            <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                <SectionHeader icon={<div className="text-lg font-bold">#</div>} title={t('staffForm.sections.notes')} />
                <FormArea control={control} name="note" placeholder={t('staffForm.fields.note.placeholder')} maxRows={4} />
            </div>
        </>
    );
};