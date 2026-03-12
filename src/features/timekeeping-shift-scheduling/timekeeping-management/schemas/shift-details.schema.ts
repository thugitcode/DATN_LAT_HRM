import { z } from 'zod';

export const shiftDetailsSchema = z.object({
  reason: z.string().trim().min(1, 'Vui lòng nhập lý do').max(500, 'Lý do không quá 500 ký tự'),
  // .optional()

  actualCheckIn: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Không hợp lệ (HH:mm)'),
  // .optional()

  actualCheckOut: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Không hợp lệ (HH:mm)'),
  // .optional()

  // faceIdCheckIn: z.string().min(1, "Thiếu ảnh FaceID check-in").optional(),

  // faceIdCheckOut: z.string().min(1, "Thiếu ảnh FaceID check-out").optional(),
});
// .refine((data) => {
//   if (!data.actualCheckIn || !data.actualCheckOut) {
//     return true;
//   }

//   const [inH, inM] = data.actualCheckIn.split(":").map(Number);
//   const [outH, outM] = data.actualCheckOut.split(":").map(Number);

//   const inMinutes = (inH ?? 0) * 60 + (inM ?? 0);
//   const outMinutes = (outH ?? 0) * 60 + (outM ?? 0);

//   return outMinutes > inMinutes;
// }, {
//   message: "Giờ ra phải lớn hơn giờ vào",
//   path: ["actualCheckOut"],
// });

export type shiftDetailsFormValues = z.infer<typeof shiftDetailsSchema>;
