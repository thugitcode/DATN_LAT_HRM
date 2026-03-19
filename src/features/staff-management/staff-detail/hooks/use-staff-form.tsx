import { useEffect } from "react";
import { useForm, type FieldValues, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { staffSchema, type StaffFormValues } from "../../staff-list-management/schemas/staff.schema";
import { STAFF_FORM_DEFAULT_VALUES } from "../constants/data";
import { useCreateStaff, useUpdateStaff } from "@/query-options/staff";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "@/i18n/constants";
import { useControlMode } from "../../salary-and-benefits/hooks/use-control-mode-handle";

export const useStaffForm = (
    isOpen: boolean,
    editData: any,
    onClose: () => void,
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

    const { handleSubmit, reset } = form;

    // Logic Reset Form khi đóng/mở hoặc chuyển mode Edit
    useEffect(() => {
        if (!isOpen) return;

        if (editData) {
            const formatDate = (date?: string) => date ? dayjs(date).format("YYYY-MM-DD") : "";

            reset({
                ...STAFF_FORM_DEFAULT_VALUES,
                ...editData,
                healthInsuranceNumber: editData?.healthInsuranceNumber ?? "",
                birthday: formatDate(editData?.birthday),
                identityIssueDate: formatDate(editData?.identityIssueDate),
                certificateExpiryDate: formatDate(editData?.certificateExpiryDate),
                departmentIds: editData?.rlsStaffDepartments?.[0]?.department?.id
                    || editData?.departments?.[0]?.id || "",
                roomIds: editData?.rlsStaffRooms?.[0]?.room?.id
                    || editData?.rooms?.[0]?.id || "",
                workType: editData?.currentWorkType || editData?.workType,
                contractType: editData?.currentContractType || editData?.contractType || editData?.lastContractType,
            });
        } else {
            reset(STAFF_FORM_DEFAULT_VALUES);
        }
    }, [isOpen, editData, reset]);

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
            departmentIds: Array.isArray(cleanedData.departmentIds)
                ? cleanedData.departmentIds
                : [cleanedData.departmentIds],
            roomIds: Array.isArray(cleanedData.roomIds)
                ? cleanedData.roomIds
                : [cleanedData.roomIds],
        };

        try {
            if (editData?.id) {
                await updateStaff({ id: editData?.id, data: payload as any });
            } else {
                await createStaff(payload as any);
            }
            onClose();
            reset(STAFF_FORM_DEFAULT_VALUES);
        } catch (error) {
            console.error("Staff Form Error:", error);
        }
    };

    return {
        form,
        handleSubmit,
        onSubmit: handleSubmit(onSubmit),
        isEdit: !!editData?.id,
        reset: reset
    };
};