import { NAMESPACES } from "@/i18n/constants";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SectionHeader } from "./section-header";
import { FormSelect } from "@/components/form-fields/form-select";
import { FormInput } from "@/components/form-fields/form-input";
import { FormDatePicker } from "@/components/form-fields/form-date-picker";
import { icons } from "@/lib/icons";
import { FormArea } from "@/components/form-fields/form-area";
import { ControlMode, useControlMode } from "@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle";
import { STAFF_SECTION_KEYS } from "../../constants/data";
import { useUpdateStaff } from "@/query-options/staff";
import { AcademicTitleEnum, StaffQualificationEnum } from "@/types/staff.type";

export const QualificationSection = () => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { control, trigger, getValues } = useFormContext();
    const certificateExpiryDate = useWatch({ control, name: 'certificateExpiryDate' });

    const cchnStatus = (() => {
      if (!certificateExpiryDate) return null;
      const expiry = new Date(certificateExpiryDate);
      const today = new Date();
      const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 0) return { type: 'expired', msg: 'Chứng chỉ hành nghề đã hết hạn! Cần cập nhật ngay.' };
      if (daysLeft <= 30) return { type: 'warning', msg: `Chứng chỉ hành nghề sắp hết hạn! Còn ${daysLeft} ngày.` };
      return null;
    })();
    const { data, setMode, isView: view } = useControlMode();

    const { mutateAsync: updateStaff, isPending: isUpdating } = useUpdateStaff();

    // --- Logic cho Khối Bằng cấp ---
    const isEditingQual = data === STAFF_SECTION_KEYS.QUALIFICATION || data === "ALL";
    const variantQual = isEditingQual ? "flat" : "underlined";
    const fieldsQual: any[] = [
        "qualification", "major", "academicTitles",
        "certificateNumber", "certificateIssuePlace", "certificateExpiryDate"
    ];

    const handleSaveQual = async () => {
        const isValid = await trigger(fieldsQual);
        if (isValid) {
            const values = getValues();
            const payload = fieldsQual.reduce((obj, key) => {
                obj[key] = values[key];
                return obj;
            }, {} as any);

            try {
                await updateStaff({ id: values.id, data: payload });
                if (data !== "ALL") setMode(ControlMode.view, null);
            } catch (error) {
                console.error("Update Qualification Failed:", error);
            }
        }
    };

    // --- Logic cho Khối Ghi chú ---
    const isEditingNotes = data === STAFF_SECTION_KEYS.NOTES || data === "ALL";
    const variantNotes = isEditingNotes ? "flat" : "underlined";
    const fieldNotes: any[] = ["note"];

    const handleSaveNotes = async () => {
        const values = getValues();
        try {
            await updateStaff({
                id: values.id,
                data: { note: values.note }
            });
            if (data !== "ALL") setMode(ControlMode.view, null);
        } catch (error) {
            console.error("Update Notes Failed:", error);
        }
    };

    return (
        <div className="space-y-6">
            {/* 5. Bằng cấp chuyên môn */}
            <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                <SectionHeader
                    icon={icons.medalRibonStar}
                    title={t('staffForm.sections.qualification')}
                    sectionKey={STAFF_SECTION_KEYS.QUALIFICATION}
                    onSave={handleSaveQual}
                />
                <div className="grid grid-cols-2 gap-4">
                    <FormSelect
                        control={control}
                        name="qualification"
                        label={t('staffForm.fields.qualification.label')}
                        isRequired
                        disabled={!isEditingQual || view}
                        variant={variantQual}
                        options={Object.values(StaffQualificationEnum).map((val) => ({
                            label: t(`options.qualifications.${val}`),
                            key: val
                        }))}
                    />
                    <FormInput
                        control={control}
                        name="major"
                        label={t('staffForm.fields.major.label')}
                        placeholder={t('staffForm.fields.major.placeholder')}
                        readOnly={!isEditingQual || view}
                        variant={variantQual}
                    />
                    <FormSelect
                        control={control}
                        name="academicTitles"
                        label={t('staffForm.fields.academicTitles.label')}
                        selectionMode="multiple"
                        readOnly={!isEditingQual || view}
                        variant={variantQual}
                        options={Object.values(AcademicTitleEnum).map((val) => ({
                            label: t(`options.academicTitles.${val}`),
                            key: val
                        }))}
                    />
                    <FormInput
                        control={control}
                        name="certificateNumber"
                        label={t('staffForm.fields.certificateNumber.label')}
                        placeholder={t('staffForm.fields.certificateNumber.placeholder')}
                        readOnly={!isEditingQual || view}
                        variant={variantQual}
                    />
                    <FormInput
                        control={control}
                        name="certificateIssuePlace"
                        label={t('staffForm.fields.certificateIssuePlace.label')}
                        placeholder={t('staffForm.fields.certificateIssuePlace.placeholder')}
                        readOnly={!isEditingQual || view}
                        variant={variantQual}
                    />
                    <FormDatePicker
                        control={control}
                        name="certificateExpiryDate"
                        label={t('staffForm.fields.certificateExpiryDate.label')}
                        isReadOnly={!isEditingQual || view}
                        variant={variantQual}
                    />
                    {cchnStatus && (
                      <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
                        cchnStatus.type === 'expired'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}>
                        <span>{cchnStatus.type === 'expired' ? '🔴' : '⚠️'}</span>
                        <span>{cchnStatus.msg}</span>
                      </div>
                    )}
                </div>
            </div>

            {/* 6. Ghi chú */}
            <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                <SectionHeader
                    icon={<div className="text-lg font-bold">#</div>}
                    title={t('staffForm.sections.notes')}
                    sectionKey={STAFF_SECTION_KEYS.NOTES}
                    onSave={handleSaveNotes}
                />
                <FormArea
                    control={control}
                    name="note"
                    placeholder={t('staffForm.fields.note.placeholder')}
                    maxRows={4}
                    readOnly={!isEditingNotes || view}
                    variant={variantNotes}
                />
            </div>
        </div>
    );
};