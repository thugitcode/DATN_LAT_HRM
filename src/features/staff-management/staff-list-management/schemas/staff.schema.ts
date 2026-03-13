import type { TFunction } from "i18next";
import z from "zod";

export const staffSchema = (t: TFunction<"staff-management", undefined>) => z.object({
    // --- Ảnh đại diện ---
    avatar: z.any()
        .optional()
        .refine((file) => !file || file.size <= 15 * 1024 * 1024, t("errors.avatar.maxSize")),

    // --- Thông tin nhân sự ---
    code: z.string().min(1, t("errors.code.required")), 
    
    name: z.string()
        .min(1, t("errors.name.required"))
        .max(100, t("errors.name.max")),

    birthday: z.string()
        .min(1, t("errors.birthday.required"))
        .refine((val) => {
            if (!val) return true;
            return new Date(val) < new Date();
        }, t("errors.birthday.future"))
        .refine((val) => {
            if (!val) return true;
            const date = new Date(val);
            const now = new Date();
            let age = now.getFullYear() - date.getFullYear();
            const m = now.getMonth() - date.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--;
            return age >= 18;
        }, t("errors.birthday.underage")),

    gender: z.string().min(1, t("errors.gender.required")),

    identity: z.string().optional().or(z.literal("")), // Số CCCD/Passport

    identityIssueDate: z.string().optional().or(z.literal(""))
        .refine((val) => !val || new Date(val) <= new Date(), t("errors.identityIssueDate.future")),

    identityIssuePlace: z.string().optional().or(z.literal("")),
    nationality: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),

    // --- Thông tin liên hệ ---
    phone: z.string()
        .min(1, t("errors.phone.required"))
        .regex(/^\d{10}$/, t("errors.phone.format")), 

    email: z.string()
        .min(1, t("errors.email.required"))
        .email(t("errors.email.format")),

    // --- Liên hệ khẩn cấp ---
    emergencyContact: z.string().optional().or(z.literal("")),
    emergencyContactPhone: z.string().optional().or(z.literal(""))
        .refine((val) => !val || /^\d{10}$/.test(val), t("errors.emergencyContactPhone.format")),
    emergencyContactAddress: z.string().optional().or(z.literal("")),
    emergencyContactRelationship: z.string().optional().or(z.literal("")),

    // --- Bằng cấp chuyên môn ---
    qualification: z.string().min(1, t("errors.qualification.required")),
    major: z.string().optional().or(z.literal("")),
    academicTitles: z.array(z.string()).optional().default([]), 
    certificateNumber: z.string().optional().or(z.literal("")), // Số CCHN
    certificateIssuePlace: z.string().optional().or(z.literal("")),
    certificateExpiryDate: z.string().optional().or(z.literal(""))
        .refine((val) => !val || new Date(val) > new Date(), t("errors.certificateExpiryDate.past")),

    // --- Khoa/Phòng làm việc ---
    departmentIds: z.string().min(1, t("errors.departmentIds.required")), 
    roomIds: z.string().optional().default(""),
    // departmentIds: z.array(z.string()).min(1, t("errors.departmentIds.required")), 
    // roomIds: z.array(z.string()).optional().default([]),
    workType: z.string(), // Read-only
    jobTitle: z.string().min(1, t("errors.jobTitle.required")), 
    position: z.string().min(1, t("errors.position.required")), // Cấp bậc trong doc
    contractType: z.string().min(1, t("errors.contractType.required")), 
    contractDuration: z.string().optional().or(z.literal("")), 

    // --- Thông tin bổ sung ---
    taxCode: z.string().optional().or(z.literal(""))
        .refine((val) => !val || /^\d{10}$/.test(val), t("errors.taxCode.format")),

    insuranceNumber: z.string().optional().or(z.literal(""))
    .refine((val) => !val || /^\d{10}$/.test(val), t("errors.insuranceNumber.format")),

    // BHXH: 10 số HOẶC 15 ký tự (chữ và số)
    socialInsuranceNumber: z.string().optional().or(z.literal(""))
        .refine((val) => {
            if (!val) return true;
            const is10Digit = /^\d{10}$/.test(val);
            const is15Char = /^[a-zA-Z0-9]{15}$/.test(val);
            return is10Digit || is15Char;
        }, t("errors.socialInsuranceNumber.format")),

    accountNumber: z.string().optional().or(z.literal("")),
    beneficiaryName: z.string().optional().or(z.literal("")),
    bankName: z.string().optional().or(z.literal("")),
    note: z.string().optional().or(z.literal("")),
});

// Lưu ý: Type inference cần một instance cụ thể hoặc dùng ReturnType
export type StaffFormValues = z.infer<ReturnType<typeof staffSchema>>;