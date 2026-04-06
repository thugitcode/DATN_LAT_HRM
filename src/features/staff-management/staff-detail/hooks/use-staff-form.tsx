import { NAMESPACES } from "@/i18n/constants";
import { useCreateStaff, useStaffDetail, useUpdateStaff } from "@/query-options/staff";
import type { Staff } from "@/types/staff.type";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ControlMode, useControlMode } from "../../salary-and-benefits/hooks/use-control-mode-handle";
import { staffSchema, type StaffFormValues } from "../../staff-list-management/schemas/staff.schema";
import { STAFF_FORM_DEFAULT_VALUES } from "../constants/data";

export const useStaffForm = (
    isOpen: boolean,
    editData?: Staff,
    onClose?: () => void,
) => {
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT)
    const { mutateAsync: createStaff, isPending } = useCreateStaff();
    const { mutateAsync: updateStaff, isPending: isUpdating } = useUpdateStaff();
    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema(t)) as Resolver<StaffFormValues, FieldValues>,
        defaultValues: STAFF_FORM_DEFAULT_VALUES,
        mode: "onChange"
    });
    const { isCreate, data: typeSubmit } = useControlMode()
    const { data: staffDetail } = useStaffDetail(editData?.id ?? "")
    const { handleSubmit, reset } = form;
    const { setMode } = useControlMode()
    // Logic Reset Form khi đóng/mở hoặc chuyển mode Edit
    useEffect(() => {
        if (!isOpen) return;

        if (staffDetail?.data) {
            const formatDate = (date?: string) => date ? dayjs(date).format("YYYY-MM-DD") : "";

            reset({
                ...STAFF_FORM_DEFAULT_VALUES,
                ...staffDetail?.data,
                healthInsuranceNumber: staffDetail?.data?.healthInsuranceNumber ?? "",
                birthday: formatDate(staffDetail?.data?.birthday),
                identityIssueDate: staffDetail?.data?.identityIssueDate ? formatDate(staffDetail?.data?.identityIssueDate) : null,
                certificateExpiryDate: formatDate(staffDetail?.data?.certificateExpiryDate),
                // departmentIds: staffDetail?.data?.rlsStaffDepartments?.[0]?.department?.id
                //     || staffDetail?.data?.departments?.[0]?.id || "",
                // roomIds: staffDetail?.data?.rlsStaffRooms?.[0]?.room?.id
                //     || staffDetail?.data?.rooms?.[0]?.id || "",
                managedRoomId: staffDetail?.data?.managedRoom?.id,
                managedDepartmentId: staffDetail?.data?.managedDepartment?.id,
                workingAreas: staffDetail?.data?.rlsStaffDepartments?.map(it => ({
                    departmentId: it.department?.id ?? "",
                    roomId: staffDetail?.data?.rlsStaffRooms?.filter(ite => ite.room.department?.id === it.department?.id)?.map(item => item?.room?.id)
                })) ?? [{ departmentId: '', roomId: [] }],
                workType: staffDetail?.data?.currentWorkType || staffDetail?.data?.workType || null,
                contractType: staffDetail?.data?.currentContractType ?? "",
            });
        } else {
            reset(STAFF_FORM_DEFAULT_VALUES);
        }
    }, [isOpen, staffDetail?.data, reset]);

    const onSubmit = async (data: StaffFormValues) => {
        if (!isCreate && typeSubmit !== "ALL") return
        const cleanedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                value === "" ? undefined : value
            ])
        );

        // Chuẩn hóa format gửi lên API (bọc array cho IDs)
        const payload = {
            ...cleanedData,
            departmentIds: data.workingAreas?.map(it => it.departmentId), roomIds: data.workingAreas?.map(it => it.roomId).flat(Infinity),
            workType: data.workType || null,
        };

        try {
            if (staffDetail?.data?.id) {
                await updateStaff({ id: staffDetail?.data?.id, data: payload as any });
                setMode(ControlMode.view);
            } else {
                await createStaff(payload as any);
            }
            onClose?.();
            reset(STAFF_FORM_DEFAULT_VALUES);
        } catch (error) {
            console.error("Staff Form Error:", error);
        }
    };

    return {
        form,
        handleSubmit,
        onSubmit: handleSubmit(onSubmit),
        isEdit: !!staffDetail?.data?.id,
        reset: reset
    };
};