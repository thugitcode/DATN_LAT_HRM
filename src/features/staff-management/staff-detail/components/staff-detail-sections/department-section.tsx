import { FormInput } from "@/components/form-fields/form-input";
import { FormSelect } from "@/components/form-fields/form-select";
import { ControlMode, useControlMode } from "@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle";
import { useDepartmentOptions } from "@/hooks/select-options/use-department-options";
import { useRoomOptions } from "@/hooks/select-options/use-room-options";
import { NAMESPACES } from "@/i18n/constants";
import { icons } from "@/lib/icons";
import { ContractTypeEnum, StaffJobTitleEnum, StaffPositionEnum } from "@/types/staff.type";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { STAFF_SECTION_KEYS } from "../../constants/data";
import { SectionHeader } from "./section-header";
import { useUpdateStaff } from "@/query-options/staff";

export const DepartmentSection = () => {
    const { control, watch, trigger, getValues } = useFormContext();
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);

    // Mutation để cập nhật dữ liệu
    const { mutateAsync: updateStaff, isPending: isUpdating } = useUpdateStaff();

    // Logic mode
    const { data, setMode, isCreate } = useControlMode();
    const isEditing = data === STAFF_SECTION_KEYS.DEPARTMENT || data === "ALL";
    const isView = !isEditing;
    const variant = isView ? "underlined" : "flat";

    // Logic lấy options
    const { options: departmentOptions } = useDepartmentOptions();
    const selectedDepts = watch("departmentIds");
    const { options: roomOptions } = useRoomOptions(selectedDepts);

    // Danh sách các fields thuộc section này để validate và lấy data
    const sectionFields: any[] = [
        "departmentIds",
        "roomIds",
        "workType",
        "jobTitle",
        "position",
        "contractType",
        "contractDuration"
    ];

    const handleSave = async () => {
        // 1. Validate riêng các field thuộc phòng ban/hợp đồng
        const isValid = await trigger(sectionFields);

        if (isValid) {
            const values = getValues();
            // 2. Trích xuất payload (chỉ gửi các field của section này)
            const payload = sectionFields.reduce((obj, key) => {
                obj[key] = values[key];
                return obj;
            }, {} as any);

            try {
                // 3. Gọi API cập nhật
                await updateStaff({
                    id: values.id,
                    data: {...payload, departmentIds: [payload?.departmentIds],roomIds: [payload?.roomIds]}
                });

                // 4. Thoát mode chỉnh sửa nếu thành công
                if (data !== "ALL") {
                    setMode(ControlMode.view, null);
                }
            } catch (error) {
                console.error("Update Department Info Failed:", error);
            }
        }
    };

    return (
        <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
            <SectionHeader
                icon={icons.case}
                title={t('staffForm.sections.department')}
                sectionKey={STAFF_SECTION_KEYS.DEPARTMENT}
                onSave={handleSave}
            />
            <div className="grid grid-cols-2 gap-4">
                {/* Khoa quản lý */}
                <FormSelect
                    control={control}
                    name="departmentIds"
                    label={t('staffForm.fields.departmentIds.label')}
                    selectionMode="single"
                    isRequired
                    disabled={isView}
                    variant={variant}
                    options={departmentOptions?.map(it => ({ key: it.value, label: it.label }))}
                />

                {/* Phòng quản lý */}
                <FormSelect
                    control={control}
                    name="roomIds"
                    label={t('staffForm.fields.roomIds.label')}
                    selectionMode="single"
                    isRequired
                    disabled={isView}
                    variant={variant}
                    options={roomOptions?.map(it => ({ key: it.value, label: it.label }))}
                />

                {/* Loại hình công việc */}
                <FormSelect
                    control={control}
                    name="workType"
                    label={t('staffForm.fields.workType.label')}
                    disabled={!isCreate}
                    variant={variant}
                    options={[
                        { key: "FULL_TIME", label: t('staffForm.fields.workType.options.fullTime') },
                        { key: "PART_TIME", label: t('staffForm.fields.workType.options.partTime') }
                    ]}
                />

                {/* Chức danh */}
                <FormSelect
                    control={control}
                    name="jobTitle"
                    label={t('staffForm.fields.jobTitle.label')}
                    isRequired
                    disabled={isView}
                    variant={variant}
                    options={Object.values(StaffJobTitleEnum).map((val) => ({
                        label: t(`options.job_title.${val}`),
                        key: val
                    }))}
                />

                {/* Cấp bậc/Chức vụ */}
                <FormSelect
                    control={control}
                    name="position"
                    label={t('staffForm.fields.position.label')}
                    isRequired
                    disabled={isView}
                    variant={variant}
                    options={Object.values(StaffPositionEnum).map((val) => ({
                        label: t(`options.staff_position.${val}`),
                        key: val
                    }))}
                />

                {/* Loại hợp đồng */}
                <FormSelect
                    control={control}
                    name="contractType"
                    label={t('staffForm.fields.contractType.label')}
                    isRequired
                    disabled={!isCreate}
                    variant={variant}
                    options={Object.values(ContractTypeEnum).map((val) => ({
                        label: t(`options.contractType.${val}`),
                        key: val
                    }))}
                />

                {/* Thời hạn hợp đồng */}
                <div className="col-span-2">
                    <FormInput
                        control={control}
                        name="contractDuration"
                        label={t('staffForm.fields.contractDuration.label')}
                        placeholder={t('staffForm.fields.contractDuration.placeholder')}
                        readOnly={isView}
                        variant={variant}
                    />
                </div>
            </div>
        </div>
    );
};