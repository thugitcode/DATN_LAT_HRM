import { z } from 'zod';

const timeToMinutes = (time: string): number => {
  const parts = time.split(':');
  if (parts.length !== 2) return NaN;
  const h = Number(parts[0]);
  const m = Number(parts[1]);
  if (Number.isNaN(h) || Number.isNaN(m)) return NaN;
  return h * 60 + m;
};

const isValidTimeFormat = (time: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);

export const shiftDetailSchema = z.object({
  shiftTemplateId: z.string().min(1, 'Ca không được để trống'),
  // Giờ chỉ validate nếu có nhập - ca linh hoạt không bắt buộc
  startTime: z.string().optional().refine(
    (v) => !v || v === '' || isValidTimeFormat(v),
    'Giờ bắt đầu không đúng định dạng HH:mm'
  ),
  endTime: z.string().optional().refine(
    (v) => !v || v === '' || isValidTimeFormat(v),
    'Giờ kết thúc không đúng định dạng HH:mm'
  ),
  note: z.string().optional(),
});

// Schema cho từng ngày (mảng shifts theo ngày)
export const dayItemSchema = z.object({
  date: z.string().min(1),
  shifts: z.array(shiftDetailSchema).min(1, 'Mỗi ngày phải có ít nhất một ca làm việc'),
});

export const workShiftAssignSchema = z
  .object({
    staffId: z.string().min(1, 'Mã nhân viên không được để trống'),
    name: z.string().min(1, 'Tên nhân viên không được để trống'),
    departmentId: z.string().min(1, 'Khoa làm việc không được để trống'),
    roomId: z.string().min(1, 'Phòng làm việc không được để trống'),

    fromDate: z
      .string()
      .min(1, 'Ngày bắt đầu không được để trống')
      .refine((v) => !isNaN(Date.parse(v)), 'Từ ngày không hợp lệ'),

    toDate: z
      .string()
      .min(1, 'Ngày kết thúc không được để trống')
      .refine((v) => !isNaN(Date.parse(v)), 'Đến ngày không hợp lệ'),

    note: z.string().optional(),

    // `details` không còn dùng trực tiếp trong form, giữ optional để tương thích với API type
    // details: z.array(shiftDetailSchema).optional(),

    // `days` là field chính quản lý shift theo ngày trong form
    days: z.array(dayItemSchema).min(1, 'Phải có ít nhất một ngày làm việc'),
  })
  .refine(
    (v) => {
      if (!v.fromDate || !v.toDate) return true;
      return new Date(v.fromDate) <= new Date(v.toDate);
    },
    {
      message: 'Ngày bắt đầu phải trước hoặc bằng ngày kết thúc',
      path: ['fromDate'],
    },
  );

export type WorkShiftAssignFormValues = z.infer<typeof workShiftAssignSchema>;