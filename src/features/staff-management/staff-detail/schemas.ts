// src/schemas/staffContractSchema.ts
import { z } from 'zod';
import { salarySchema } from '../salary-and-benefits/schemas';

export const staffContractSchema = z.object({
    contractType: z.string().min(1, 'Vui lòng chọn loại hợp đồng'),
    workType: z.string().min(1, 'Vui lòng chọn loại hình làm việc'),
    jobTitle: z.string().min(1, 'Vui lòng chọn chức danh'),
    position: z.string().min(1, 'Vui lòng chọn cấp bậc'),
    duration: z.string().min(1, 'Vui lòng nhập thời hạn').refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        'Thời hạn phải là số dương'
    ),
    durationUnit: z.enum(['YEAR', 'MONTH']),
    contractNumber: z.string().optional(),
    startDate: z.string().min(1, 'Vui lòng chọn ngày bắt đầu'),
    endDate: z.string().min(1, 'Vui lòng chọn ngày kết thúc'),
    // departmentId: z.string().min(1, 'Vui lòng chọn khoa quản lý'),
    roomId: z.string().optional(),
    directManagerIds: z.array(z.string()).min(1, 'Vui lòng chọn ít nhất một quản lý trực tiếp'),
    shiftType: z.string().min(1, 'Vui lòng chọn loại hình làm việc theo ca'),
    fixedShiftId: z.string().optional(),
    workingDays: z.array(z.number()).min(1, 'Vui lòng chọn ít nhất một ngày làm việc'),
    workingAreas: z
        .array(
            z.object({
                departmentId: z.string().min(1, 'Vui lòng chọn khoa làm việc'),
                roomId: z.string().optional(), // phòng có thể optional
            })
        )
        .min(1, 'Phải có ít nhất một khu vực làm việc')
        .refine(
            (areas) => areas.every((area) => area.departmentId), // đảm bảo departmentId không rỗng
            { message: 'Khoa làm việc không được để trống' }
        ),
    salary: salarySchema,
    // ... các field khác sẽ bổ sung sau
});

export type StaffContractFormValues = z.infer<typeof staffContractSchema>;
