import { FormInput } from "@/components/form-fields/form-input";
import { FormSelect } from "@/components/form-fields/form-select";
import { ControlMode, useControlMode } from "@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle";
import { useDepartmentOptions } from "@/hooks/select-options/use-department-options";
import { useJobTitleOptions } from "@/hooks/select-options/use-job-title-options";
import { useRoomOptions } from "@/hooks/select-options/use-room-options";
import { NAMESPACES } from "@/i18n/constants";
import { icons } from "@/lib/icons";
import { useUpdateStaff } from "@/query-options/staff";
import { ContractTypeEnum, StaffPositionEnum, WorkingTypeEnum } from "@/types/staff.type";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { STAFF_SECTION_KEYS } from "../../constants/data";
import { WorkingAreaSection } from "../contract-and-salary-sections/working-area-section";
import { SectionHeader } from "./section-header";

export const DepartmentSection = () => {
    const { control, watch, trigger, getValues } = useFormContext();
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);

    // Mutation để cập nhật dữ liệu
    const { mutateAsync: updateStaff } = useUpdateStaff();

    // Logic mode
    const { data, setMode, isCreate, isView: view } = useControlMode();

    const isEditing = data === STAFF_SECTION_KEYS.DEPARTMENT || data === "ALL";
    const isView = !isEditing || view;
    const variant = isView ? "underlined" : "flat";

    // Logic lấy options
    const { options: departmentOptions } = useDepartmentOptions();
    const { options: jobTitleOptions } = useJobTitleOptions();
    const selectedDepts = watch("managedDepartmentId");
    const { options: roomOptions } = useRoomOptions(selectedDepts);

    // Danh sách các fields thuộc section này để validate và lấy data
    const sectionFields: any[] = [
        "workingAreas",
        "managedDepartmentId",
        "managedRoomId",
        "workType",
        "jobTitleId",
        "position",
        "contractType",
        "workingPeriod"
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
                    data: {
                        ...payload, departmentIds: payload.workingAreas?.map((it: any) => it.departmentId), roomIds: payload.workingAreas?.map((it: any) => it.roomId).flat(Infinity),
                        workType: payload.workType || null,
                    }
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
                    name="managedDepartmentId"
                    label={t('staffForm.fields.departmentIds.label')}
                    selectionMode="single"
                    isRequired
                    readOnly={isView}
                    variant={variant}
                    options={departmentOptions?.map(it => ({ key: it.value, label: it.label }))}
                />

                {/* Phòng quản lý */}
                <FormSelect
                    control={control}
                    name="managedRoomId"
                    label={t('staffForm.fields.roomIds.label')}
                    selectionMode="single"
                    isRequired
                    readOnly={isView}
                    variant={variant}
                    options={roomOptions?.map(it => ({ key: it.value, label: it.label }))}
                />
                {/* Khoa phòng làm việc */}
                <div className="col-span-2">
                    <WorkingAreaSection isView={isView} variant={variant} />
                </div>
                {/* Loại hình công việc */}
                <FormSelect
                    control={control}
                    name="workType"
                    label={t('staffForm.fields.workType.label')}
                    placeholder={t('staffForm.fields.workType.placeholder')}
                    readOnly={!isCreate || isView}
                    variant={variant}
                    options={Object.values(WorkingTypeEnum).map((val) => ({
                        label: t(`options.workType.${val}`),
                        key: val
                    }))}
                />

                {/* Chức danh */}
                <FormSelect
                    control={control}
                    name="jobTitleId"
                    label={t('staffForm.fields.jobTitle.label')}
                    isRequired
                    readOnly={isView}
                    variant={variant}
                    options={jobTitleOptions.map((jt) => ({ key: jt.value, label: jt.label }))}
                />

                {/* Cấp bậc/Chức vụ */}
                <FormSelect
                    control={control}
                    name="position"
                    label={t('staffForm.fields.position.label')}
                    isRequired
                    readOnly={isView}
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
                    readOnly={!isCreate || isView}
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
                        name="workingPeriod"
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