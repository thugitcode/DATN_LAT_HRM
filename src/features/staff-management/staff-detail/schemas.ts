// src/schemas/staffContractSchema.ts
import { z } from 'zod';
const salarySchema = z
    .object({
        hasHealthInsurance: z.boolean().default(false),
        healthInsuranceRate: z.string().optional(),

        hasSocialInsurance: z.boolean().default(false),
        socialInsuranceRate: z.string().optional(),

        hasUnemploymentInsurance: z.boolean().default(false),
        unemploymentInsuranceRate: z.string().optional(),

        hasUnionFee: z.boolean().default(false),
        unionFee: z.string().optional(),

        // ── Bảo hiểm sức khỏe ───────────────────────────────
        hasHealthCareInsurance: z.boolean().default(false),
        healthCareInsuranceCompany: z.string().optional(),
        healthCareInsuranceBenefit: z.string().optional(),    // mức hưởng (VNĐ)
        healthCareInsuranceRate: z.string().optional(),       // mức đóng (%)


        // ---cấu trúc lương---------------------------------
        basicSalary: z.string().min(1, 'Vui lòng nhập lương cơ bản'), // bắt buộc
        insuranceSalary: z.string().optional(),
        responsibilityAllowance: z.string().optional(),
        positionAllowance: z.string().optional(),
        hazardAllowance: z.string().optional(),
        mealAllowance: z.string().min(1, 'Vui lòng nhập phụ cấp ăn ca'),
        mealAllowanceUnit: z.enum(['DAY', 'MONTH']).default('DAY'),
        fuelAllowance: z.string().optional(),
        phoneAllowance: z.string().optional(),
        businessTripAllowance: z.string().optional(),
        otherAllowance: z.string().optional(),


        //Thông tin lương
        salaryType: z.enum(['GROSS', 'NET']).default('NET'),
        netSalary: z.string().optional(),
        grossSalary: z.string().optional(),

        //Nghỉ phép và phúc lợi
        leaveQuotaIds: z.array(z.string()).optional().default([]),

        // thếu TNCN
        hasFamilyDeduction: z.boolean().default(false),
        dependentsCount: z.string().optional(),

        hasPersonalIncomeTax: z.boolean().default(true), // default true như code gốc
        personalIncomeTaxRate: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        // Bảo hiểm y tế
        if (data.hasHealthInsurance && !data.healthInsuranceRate?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Vui lòng nhập tỷ lệ đóng bảo hiểm y tế',
                path: ['healthInsuranceRate'],
            });
        }

        // Bảo hiểm xã hội
        if (data.hasSocialInsurance && !data.socialInsuranceRate?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Vui lòng nhập tỷ lệ đóng bảo hiểm xã hội',
                path: ['socialInsuranceRate'],
            });
        }

        // Bảo hiểm thất nghiệp
        if (data.hasUnemploymentInsurance && !data.unemploymentInsuranceRate?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Vui lòng nhập tỷ lệ đóng bảo hiểm thất nghiệp',
                path: ['unemploymentInsuranceRate'],
            });
        }

        // Công đoàn
        if (data.hasUnionFee && !data.unionFee?.trim()) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Vui lòng nhập mức đóng công đoàn',
                path: ['unionFee'],
            });
        }

        // Nếu muốn validate thêm (ví dụ phải là số, > 0, <= 100 cho %)
        // Bạn có thể mở rộng ở đây, ví dụ:
        if (data.hasHealthInsurance && data.healthInsuranceRate) {
            const rate = Number(data.healthInsuranceRate.replace(/[^0-9.]/g, ''));
            if (isNaN(rate) || rate <= 0 || rate > 100) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Tỷ lệ phải là số từ 0 đến 100',
                    path: ['healthInsuranceRate'],
                });
            }
        }
        if (data.hasHealthCareInsurance) {
            if (!data.healthCareInsuranceCompany?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Vui lòng nhập tên công ty bảo hiểm sức khỏe',
                    path: ['healthCareInsuranceCompany'],
                });
            }

            if (!data.healthCareInsuranceBenefit?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Vui lòng nhập mức hưởng bảo hiểm sức khỏe',
                    path: ['healthCareInsuranceBenefit'],
                });
            } else {
                const benefit = Number(data.healthCareInsuranceBenefit.replace(/[^0-9]/g, ''));
                if (isNaN(benefit) || benefit <= 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Mức hưởng phải là số dương',
                        path: ['healthCareInsuranceBenefit'],
                    });
                }
            }

            if (!data.healthCareInsuranceRate?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Vui lòng nhập mức đóng bảo hiểm sức khỏe',
                    path: ['healthCareInsuranceRate'],
                });
            } else {
                const rate = Number(data.healthCareInsuranceRate.replace(/[^0-9.]/g, ''));
                if (isNaN(rate) || rate <= 0 || rate > 100) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Mức đóng phải là số từ 0 đến 100',
                        path: ['healthCareInsuranceRate'],
                    });
                }
            }
        }

        if (data.basicSalary) {
            const val = Number(data.basicSalary.replace(/[^\d]/g, ''));
            if (isNaN(val) || val <= 0) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Lương cơ bản phải là số dương',
                    path: ['basicSalary'],
                });
            }
        }


        // if (data.salaryType === 'NET' && !data.netSalary?.trim()) {
        //     ctx.addIssue({
        //         code: z.ZodIssueCode.custom,
        //         message: 'Vui lòng nhập lương net',
        //         path: ['netSalary'],
        //     });
        // }

        // if (data.salaryType === 'GROSS' && !data.grossSalary?.trim()) {
        //     ctx.addIssue({
        //         code: z.ZodIssueCode.custom,
        //         message: 'Vui lòng nhập lương gross',
        //         path: ['grossSalary'],
        //     });
        // }

        // Validate số dương nếu có giá trị
        // if (data.netSalary) {
        //     const val = Number(data.netSalary.replace(/[^\d]/g, ''));
        //     if (isNaN(val) || val <= 0) {
        //         ctx.addIssue({
        //             code: z.ZodIssueCode.custom,
        //             message: 'Lương net phải là số dương',
        //             path: ['netSalary'],
        //         });
        //     }
        // }

        // if (data.grossSalary) {
        //     const val = Number(data.grossSalary.replace(/[^\d]/g, ''));
        //     if (isNaN(val) || val <= 0) {
        //         ctx.addIssue({
        //             code: z.ZodIssueCode.custom,
        //             message: 'Lương gross phải là số dương',
        //             path: ['grossSalary'],
        //         });
        //     }
        // }

        // Giảm trừ gia cảnh
        if (data.hasFamilyDeduction) {
            if (!data.dependentsCount?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Vui lòng nhập số người phụ thuộc',
                    path: ['dependentsCount'],
                });
            } else {
                const count = Number(data.dependentsCount.replace(/[^\d]/g, ''));
                if (isNaN(count) || count < 0) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Số người phụ thuộc phải là số không âm',
                        path: ['dependentsCount'],
                    });
                }
            }
        }

        // Thuế TNCN
        if (data.hasPersonalIncomeTax) {
            if (!data.personalIncomeTaxRate?.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Vui lòng nhập tỷ lệ thuế TNCN',
                    path: ['personalIncomeTaxRate'],
                });
            } else {
                const rate = Number(data.personalIncomeTaxRate.replace(/[^0-9.]/g, ''));
                if (isNaN(rate) || rate < 0 || rate > 100) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Tỷ lệ thuế TNCN phải từ 0 đến 100',
                        path: ['personalIncomeTaxRate'],
                    });
                }
            }
        }
        // Làm tương tự cho các field % khác nếu cần
    })
    .optional(); // vẫn giữ .optional() cho toàn bộ salary nếu phù hợp
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
    departmentId: z.string().min(1, 'Vui lòng chọn khoa quản lý'),
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