import type { TFunction } from "i18next";
import z from "zod";

export const normalizeString = (v: unknown) => (v === null || v === undefined ? "" : String(v));

// required string
export const requiredString = (message: string) =>
    z.preprocess(normalizeString, z.string().min(1, message));

// optional string
const optionalString = () =>
    z.preprocess(normalizeString, z.string()).optional();

// optional string + regex
const optionalRegex = (regex: RegExp, message: string) =>
    z.preprocess(
        normalizeString,
        z.string().refine((v) => !v || regex.test(v), message),
    );

export const requiredEmail = (requiredMsg: string, formatMsg: string) =>
    z.preprocess(
        normalizeString,
        z.string()
            .min(1, requiredMsg)
            .email(formatMsg)
    );
export const staffSchema = (t: TFunction<"staff-management", undefined>) =>
    z.object({

        // --- Ảnh ---
        avatar: optionalString(),

        // --- Thông tin nhân sự ---
        code: z.string().optional(),

        name: z.preprocess(
            normalizeString,
            z
                .string()
                .min(1, t("errors.name.required"))
                .max(100, t("errors.name.max")),
        ),

        birthday: z
            .preprocess(normalizeString, z.string().min(1, t("errors.birthday.required")))
            .refine((val) => new Date(val) < new Date(), t("errors.birthday.future"))
            .refine((val) => {
                const date = new Date(val);
                const now = new Date();

                let age = now.getFullYear() - date.getFullYear();
                const m = now.getMonth() - date.getMonth();

                if (m < 0 || (m === 0 && now.getDate() < date.getDate())) age--;

                return age >= 18;
            }, t("errors.birthday.underage")),

        gender: requiredString(t("errors.gender.required")),

        identity: optionalString(),
        identityIssuePlace: optionalString(),
        nationality: optionalString(),
        address: optionalString(),

        identityIssueDate: optionalString().nullable().refine(
            (val) => !val || new Date(val) <= new Date(),
            t("errors.identityIssueDate.future"),
        ),

        // --- Liên hệ ---
        phone: requiredString(t("errors.phone.required")).refine(
            (val) => /^\d{10}$/.test(val),
            t("errors.phone.format"),
        ),

        email: requiredEmail(
            t("errors.email.required"),
            t("errors.email.format")
        ),

        // --- Liên hệ khẩn cấp ---
        emergencyContact: optionalString(),

        emergencyContactPhone: optionalRegex(
            /^\d{10}$/,
            t("errors.emergencyContactPhone.format"),
        ),

        emergencyContactAddress: optionalString(),
        emergencyContactRelationship: optionalString(),
        managedRoomId: requiredString('Vui lòng chọn phòng quản lý'),
        managedDepartmentId: requiredString('Vui lòng chọn khoa quản lý'),
        // --- Bằng cấp ---
        qualification: requiredString(t("errors.qualification.required")),

        major: optionalString(),

        academicTitles: z.array(z.string()).optional().default([]),

        certificateNumber: optionalString(),
        certificateIssuePlace: optionalString(),

        certificateExpiryDate: optionalString().refine(
            (val) => !val || new Date(val) > new Date(),
            t("errors.certificateExpiryDate.past"),
        ),

        // --- Khoa phòng ---
        // departmentIds: requiredString(t("errors.departmentIds.required")),
        // // roomIds: z.string().optional().default(""),
        // roomIds: requiredString(t("errors.roomIds.required")),
        workingAreas: z
            .array(
                z.object({
                    departmentId: z.preprocess(normalizeString, z.string().min(1, "Vui lòng chọn khoa làm việc")),
                    roomId: z.array(z.string()).optional(), // phòng có thể optional
                })
            )
            .min(1, 'Phải có ít nhất một khu vực làm việc')
            .refine(
                (areas) => areas.every((area) => area.departmentId), // đảm bảo departmentId không rỗng
                { message: 'Khoa làm việc không được để trống' }
            ),
        workType: optionalString().nullable(),

        jobTitleId: requiredString(t("errors.jobTitle.required")),
        position: requiredString(t("errors.position.required")),
        contractType: requiredString(t("errors.contractType.required")),

        contractDuration: optionalString(),
        workingPeriod: optionalString(),

        // --- Thông tin bổ sung ---
        taxCode: optionalRegex(/^\d{10}$/, t("errors.taxCode.format")),

        healthInsuranceNumber: optionalRegex(
            /^\d{10}$/,
            t("errors.healthInsuranceNumber.format"),
        ),

        insuranceNumber: optionalString().refine((val) => {
            if (!val) return true;

            const is10Digit = /^\d{10}$/.test(val);
            const is15Char = /^[a-zA-Z0-9]{15}$/.test(val);

            return is10Digit || is15Char;
        }, t("errors.insuranceNumber.format")),

        accountNumber: optionalString(),
        beneficiaryName: optionalString(),
        bankName: optionalString(),
        note: optionalString(),
    });

// Lưu ý: Type inference cần một instance cụ thể hoặc dùng ReturnType
export type StaffFormValues = z.infer<ReturnType<typeof staffSchema>>;