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

    file: z
        .instanceof(File, { message: 'File không được để trống' })
        .refine((file) => file.size <= MAX_FILE_SIZE, {
            message: 'Dung lượng file tối đa 5MB',
        })
        .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
            message: 'Định dạng file không hợp lệ',
        })
        .nullable(),
});


export type DocumentFormValues = z.infer<typeof documentSchema>;