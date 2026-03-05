// schemas/document.schema.ts
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

export const fileSchema = z
    .array(z.instanceof(File))
    .min(1, { message: "Vui lòng chọn ít nhất 1 file" })
    .refine(
        (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
        { message: "Mỗi file tối đa 5MB" }
    )
    .refine(
        (files) => files.every((file) => ACCEPTED_FILE_TYPES.includes(file.type)),
        { message: "Có file không đúng định dạng" }
    );

export const documentSchema = z.object({
    documentType: z
        .string()
        .min(1, 'Tên loại giấy tờ không được để trống'),

    updateDate: z
        .string()
        .optional(),
    note: z
        .string()
        .optional(),
    updater: z
        .string()
        .optional(),

    files: fileSchema
        .nullable(),
});


export type DocumentFormValues = z.infer<typeof documentSchema>;