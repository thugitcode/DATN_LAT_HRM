import { z } from 'zod';
import { salaryInnerSchema } from '../salary-and-benefits/schemas';

export const staffContractSchema = z.object({
    contractType: z.string().min(1, 'Vui lòng chọn loại hợp đồng'),
    workType: z.string().min(1, 'Vui lòng chọn loại hình làm việc'),
    jobTitle: z.string().min(1, 'Vui lòng chọn chức danh'),
    position: z.string().min(1, 'Vui lòng chọn cấp bậc'),
    workingTime: z.string().min(1, 'Vui lòng nhập thời gian làm việc').refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        'Thời gian làm việc phải là số dương'
    ),
    workingTimeUnit: z.enum(['DAY', 'WEEK', 'MONTH']),
    managedRoomId: z.string().optional(),
    managedDepartmentId: z.string().optional(),
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
                departmentId: z.string().min(1, "Vui lòng chọn khoa làm việc"),
                roomId: z.array(z.string()).optional(), // phòng có thể optional
            })
        )
        .min(1, 'Phải có ít nhất một khu vực làm việc')
        .refine(
            (areas) => areas.every((area) => area.departmentId), // đảm bảo departmentId không rỗng
            { message: 'Khoa làm việc không được để trống' }
        ),
    salary: salaryInnerSchema,
    // ... các field khác sẽ bổ sung sau
}).refine(
    (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return start < end;
    },
    {
        message: "Ngày kết thúc phải lớn hơn ngày bắt đầu",
        path: ["endDate"], // chỉ định lỗi hiển thị ở field endDate
    }
);
;

export type StaffContractFormValues = z.infer<typeof staffContractSchema>;
