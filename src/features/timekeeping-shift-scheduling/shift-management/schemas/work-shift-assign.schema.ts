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

export const shiftDetailSchema = z
  .object({
    startTime: z
      .string()
      .min(1, 'Giờ bắt đầu không được để trống')
      .refine(isValidTimeFormat, 'Giờ bắt đầu không đúng định dạng HH:mm'),

    endTime: z
      .string()
      .min(1, 'Giờ kết thúc không được để trống')
      .refine(isValidTimeFormat, 'Giờ kết thúc không đúng định dạng HH:mm'),

    shiftTemplateId: z.string().min(1, 'Ca không được để trống'),
    note: z.string().optional(),
  })
  .refine((v) => timeToMinutes(v.startTime) < timeToMinutes(v.endTime), {
    message: 'Giờ bắt đầu phải trước giờ kết thúc',
    path: ['endTime'],
  });

export const workShiftAssignSchema = z
  .object({
    staffId: z.string().min(1, 'Mã nhân viên không được để trống'),
    departmentId: z.string().min(1, 'Khoa làm việc không được để trống'),
    roomId: z.string().min(1, 'Phòng làm việc không được để trống'),
    name: z.string().min(1, 'Tên nhân viên không được để trống'),

    fromDate: z
      .string()
      .min(1, 'Từ ngày không được để trống')
      .refine((v) => !isNaN(Date.parse(v)), 'Từ ngày không hợp lệ'),

    toDate: z
      .string()
      .min(1, 'Đến ngày không được để trống')
      .refine((v) => !isNaN(Date.parse(v)), 'Đến ngày không hợp lệ'),

    // dateRangeSchema: z.array(z.date()).length(1, 'Phải chọn ngày bắt đầu và ngày kết thúc'),
    // dateRangeSchema: z.string().optional(),
    dateRangeSchema: z.string().min(1, 'Vui lòng chọn khoảng ngày'),

    note: z.string().optional(),

    details: z.array(shiftDetailSchema).min(1, 'Phải có ít nhất một ca làm việc'),
  })

  .refine((v) => new Date(v.toDate) >= new Date(v.fromDate), {
    message: 'Đến ngày phải sau hoặc bằng từ ngày',
    path: ['toDate'],
  })

  .refine(
    (v) => {
      const details = v.details;
      if (!details || details.length <= 1) return true;

      const sorted = [...details].sort(
        (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
      );

      for (let i = 0; i < sorted.length - 1; i++) {
        const current = sorted[i];
        const next = sorted[i + 1];

        if (!current || !next) continue;

        const currentEnd = timeToMinutes(current.endTime);
        const nextStart = timeToMinutes(next.startTime);

        if (currentEnd > nextStart) {
          return false;
        }
      }

      return true;
    },
    {
      message: 'Các ca làm việc không được chồng giờ',
      path: ['details'],
    },
  );

export type WorkShiftAssignFormValues = z.infer<typeof workShiftAssignSchema>;
