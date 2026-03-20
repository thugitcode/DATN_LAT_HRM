import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ACCEPTED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
];

export const documentSchema = z.object({
    // Map "documentType" -> "name"
    documentName: z
        .string()
        .min(1, 'Tên loại giấy tờ không được để trống'),

    // Các field thông tin bổ sung từ BE
    note: z.string().optional().nullable(),
    staffId: z.string().min(1, 'Thiếu ID nhân viên'),
    createdByName: z.string().optional(),
    createdAt: z.string().optional(),

    // Thông tin file trả về từ BE
    fileUrl: z.string().url().optional().nullable(),
    filePath: z.string().optional().nullable(),
    fileName: z.string().optional().nullable(),
    fileType: z.string().optional().nullable(),
    fileSize: z.number().optional().nullable(),
    thumbnail: z.string().optional().nullable(),

    // Field dùng để xử lý upload ở phía Client
    files: z
        .array(z.any())
        .min(1, { message: "Vui lòng chọn ít nhất 1 file" })
        .refine(
            (files) => files.every((file) => !file.size || file.size <= MAX_FILE_SIZE),
            { message: "Mỗi file tối đa 5MB" }
        )
        .refine(
            (files) => files.every((file) => !file.type || ACCEPTED_FILE_TYPES.includes(file.type)),
            { message: "Có file không đúng định dạng" }
        )
        .nullable()
        .optional(),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;