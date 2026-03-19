import type { TFunction } from "i18next";
import z from "zod";

const normalizeString = (v: unknown) => (v === null || v === undefined ? "" : v);

// optional string
const optionalString = () =>
    z.preprocess(normalizeString, z.string()).optional();
export const staffSchema = (t: TFunction<"payroll-management", undefined>) =>
    z.object({
        name: z.preprocess(normalizeString, z.string().min(1, t("revenue.validate.require_staff", "Vui lòng chọn nhân viên"))),
        staffId: z.preprocess(normalizeString, z.string().min(1, t("revenue.validate.require_staff", "Vui lòng chọn nhân viên"))),
        staffCode: z.preprocess(normalizeString, z.string().min(1, t("revenue.validate.require_staff", "Vui lòng chọn nhân viên"))),
        departmentId: z.preprocess(normalizeString, z.string().min(1, t("revenue.validate.require_department", "Vui lòng chọn khoa/phòng"))),
        roomId: optionalString(),
    });
const baseRevenueSchema = (t: TFunction<"payroll-management", undefined>) =>
    z.object({
        achievementRate: z.coerce.number(),

        month: z.any().refine((val) => val, t("revenue.validate.require_month", "Vui lòng chọn tháng")),

        targetAmount: z.coerce.number().min(0, t("revenue.validate.invalid_target", "Mục tiêu không hợp lệ")),
        actualAmount: z.coerce.number().min(0, t("revenue.validate.invalid_actual", "Thực đạt không hợp lệ")),
        note: optionalString(),
    });

export const revenueSchema = (t: TFunction<"payroll-management", undefined>, isEdit?: boolean) => {
    const revSchema = baseRevenueSchema(t);
    return isEdit ? revSchema : revSchema.merge(staffSchema(t));
};

export type RevenueFormValues = z.infer<ReturnType<typeof baseRevenueSchema>> & Partial<z.infer<ReturnType<typeof staffSchema>>>;
