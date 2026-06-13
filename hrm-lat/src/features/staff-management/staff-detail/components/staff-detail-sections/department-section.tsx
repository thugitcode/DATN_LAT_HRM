import { FormInput } from "@/components/form-fields/form-input";
import { FormSelect } from "@/components/form-fields/form-select";
import { ControlMode, useControlMode } from "@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle";
import { useDepartmentOptions } from "@/hooks/select-options/use-department-options";
import { useJobTitleOptions } from "@/hooks/select-options/use-job-title-options";
import { NAMESPACES } from "@/i18n/constants";
import { icons } from "@/lib/icons";
import { useUpdateStaff } from "@/query-options/staff";
import { ContractTypeEnum, StaffPositionEnum, WorkingTypeEnum } from "@/types/staff.type";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { STAFF_SECTION_KEYS } from "../../constants/data";
import { WorkingAreaSection } from "../contract-and-salary-sections/working-area-section";
import { SectionHeader } from "./section-header";
import { useQuery } from "@tanstack/react-query";
import { roomQueryOptions } from "@/services/query-options/room.query";

export const DepartmentSection = () => {
    const { control, watch, trigger, getValues } = useFormContext();
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);

    const { mutateAsync: updateStaff } = useUpdateStaff();
    const { data, setMode, isCreate, isView: view } = useControlMode();

    const isEditing = data === STAFF_SECTION_KEYS.DEPARTMENT || data === "ALL";
    const isView = !isEditing || view;
    const variant = isView ? "underlined" : "flat";

    // Load toàn bộ options
    const { options: departmentOptions, isLoading: deptLoading } = useDepartmentOptions();
    const { options: jobTitleOptions } = useJobTitleOptions();

    // Load TẤT CẢ phòng 1 lần, filter client-side theo managedDepartmentId
    const { data: allRoomsRes, isLoading: roomLoading } = useQuery(
        roomQueryOptions.list({ getAll: true })
    );
    const allRooms = (allRoomsRes?.data as any[]) || [];

    const managedDeptId = watch("managedDepartmentId");

    // Filter phòng theo khoa quản lý đã chọn - so sánh string chắc chắn
    const roomOptions = allRooms
        .filter((r: any) => {
            if (!managedDeptId) return true;
            return String(r.department?.id ?? '') === String(managedDeptId);
        })
        .map((r: any) => ({ key: String(r.id), label: r.name }));

    const sectionFields: any[] = [
        "workingAreas", "managedDepartmentId", "managedRoomId",
        "workType", "jobTitleId", "position", "contractType", "workingPeriod"
    ];

    const handleSave = async () => {
        const isValid = await trigger(sectionFields);
        if (isValid) {
            const values = getValues();
            const payload = sectionFields.reduce((obj, key) => {
                obj[key] = values[key];
                return obj;
            }, {} as any);

            try {
                await updateStaff({
                    id: values.id,
                    data: {
                        ...payload,
                        departmentIds: payload.workingAreas?.map((it: any) => it.departmentId),
                        roomIds: payload.workingAreas?.map((it: any) => it.roomId).flat(Infinity),
                        workType: payload.workType || null,
                    }
                });
                if (data !== "ALL") setMode(ControlMode.view, null);
            } catch (error) {
                console.error("Update Department Info Failed:", error);
            }
        }
    };

    // Chờ options load xong mới render để tránh hiện "Chọn" do race condition
    if (deptLoading || roomLoading) {
        return (
            <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                <div className="text-sm text-gray-400 py-4">Đang tải dữ liệu...</div>
            </div>
        );
    }

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
                    options={departmentOptions?.map(it => ({ key: String(it.value), label: it.label }))}
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
                    options={roomOptions}
                />

                {/* Khoa phòng làm việc */}
                <div className="col-span-2">
                    <WorkingAreaSection isView={isView} variant={variant} />
                </div>

                {/* Loại hình */}
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
                    options={jobTitleOptions.map((jt) => ({ key: String(jt.value), label: jt.label }))}
                />

                {/* Cấp bậc */}
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

                {/* Thời hạn */}
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