import { FormSelect } from "@/components/form-fields/form-select";
import { SectionHeader } from "./section-header";
import { FormInput } from "@/components/form-fields/form-input";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "@/i18n/constants";
import { icons } from "@/lib/icons";
import { useDepartmentOptions } from "@/hooks/select-options/use-department-options";
import { useRoomOptions } from "@/hooks/select-options/use-room-options";
import { useFormContext } from "react-hook-form";

export const DepartmentSection = () => {
    const { control, watch } = useFormContext();
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT)
    const { options: departmentOptions } = useDepartmentOptions();
    const selectedDepts = watch("departmentIds");

    const { options: roomOptions } = useRoomOptions(selectedDepts);
    return (
        <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
            <SectionHeader icon={icons.case} title={t('staffForm.sections.department')} />
            <div className="grid grid-cols-2 gap-4">
                <FormSelect control={control} name="departmentIds" label={t('staffForm.fields.departmentIds.label')} selectionMode="single" isRequired options={departmentOptions?.map(it => { return { key: it.value, label: it.label } })} />
                <FormSelect control={control} name="roomIds" label={t('staffForm.fields.roomIds.label')} selectionMode="single" isRequired options={roomOptions?.map(it => { return { key: it.value, label: it.label } })} />
                <FormSelect control={control} name="workType" label={t('staffForm.fields.workType.label')} options={[{ key: "FT", label: t('staffForm.fields.workType.options.fullTime') }, { key: "PT", label: t('staffForm.fields.workType.options.partTime') }]} />
                <FormSelect control={control} name="jobTitle" label={t('staffForm.fields.jobTitle.label')} isRequired options={['doctor', 'nurse', 'technician', 'midwife', 'physicianAssistant', 'officeStaff'].map(k => ({ key: k.toUpperCase(), label: t(`options.jobTitle.${k}`) }))} />
                <FormSelect control={control} name="position" label={t('staffForm.fields.position.label')} isRequired options={['STAFF', 'HEAD_OF_DEPARTMENT', 'DEPUTY_HEAD_OF_DEPARTMENT', 'CHIEF_NURSE', 'MANAGER', 'HEAD_OF_UNIT', 'DEPUTY_MANAGER'].map(k => ({ key: k, label: t(`options.position.${k}`) }))} />
                <FormSelect control={control} name="contractType" label={t('staffForm.fields.contractType.label')} isRequired options={['official', 'probation', 'internship', 'expert'].map(k => ({ key: k.toUpperCase(), label: t(`options.contractType.${k}`) }))} />
                <div className="col-span-2">
                    <FormInput control={control} name="contractDuration" label={t('staffForm.fields.contractDuration.label')} placeholder={t('staffForm.fields.contractDuration.placeholder')} />
                </div>
            </div>
        </div>
    )
};