import z from "zod";

export const salaryInnerSchema = z
    .object({
        hasHealthInsurance: z.boolean().default(false).optional(),
        healthInsuranceRate: z.string().optional(),

        hasSocialInsurance: z.boolean().default(false).optional(),
        socialInsuranceRate: z.string().optional(),

        hasUnemploymentInsurance: z.boolean().default(false).optional(),
        unemploymentInsuranceRate: z.string().optional(),

        hasUnionFee: z.boolean().default(false).optional(),
        unionFee: z.string().optional(),

        // ── Bảo hiểm sức khỏe ───────────────────────────────
        hasHealthCareInsurance: z.boolean().default(false).optional(),
        healthCareInsuranceCompany: z.string().optional(),
        healthCareInsuranceBenefit: z.string().optional(),    // mức hưởng (VNĐ)
        healthCareInsuranceRate: z.string().optional(),       // mức đóng (%)


        // ---cấu trúc lương---------------------------------
        basicSalary: z.string().min(1, 'Vui lòng nhập lương cơ bản'), // bắt buộc
        insuranceSalary: z.string().optional(),
        responsibilityAllowance: z.string().optional(),
        positionAllowance: z.string().optional(),
        hazardAllowance: z.string().optional(),
        mealAllowance: z.string().optional(),
        mealAllowanceUnit: z.enum(['DAY', 'MONTH']).default('DAY').optional(),
        fuelAllowance: z.string().optional(),
        phoneAllowance: z.string().optional(),
        businessTripAllowance: z.string().optional(),
        otherAllowance: z.string().optional(),


        //Thông tin lương
        salaryType: z.enum(['GROSS', 'NET']).default('NET').optional(),
        netSalary: z.string().optional(),
        grossSalary: z.string().optional(),

        //Nghỉ phép và phúc lợi
        leaveQuotaIds: z.array(z.string()).optional().default([]).optional(),

        // thếu TNCN
        hasFamilyDeduction: z.boolean().default(false).optional(),
        dependentsCount: z.string().optional(),

        hasPersonalIncomeTax: z.boolean().default(true).optional(), // default true như code gốc
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

        // Nếu muốn validate thêm (ví dụ phải là số, > 0, < 100 cho %)
        // Bạn có thể mở rộng ở đây, ví dụ:
        if (data.hasHealthInsurance && data.healthInsuranceRate) {
            const rate = Number(data.healthInsuranceRate.replace(/[^0-9.]/g, ''));
            if (isNaN(rate) || rate < 0 || rate > 100) {
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
                if (isNaN(benefit) || benefit < 0) {
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
                if (isNaN(rate) || rate < 0 || rate > 100) {
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
            if (isNaN(val) || val < 0) {
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
        //     if (isNaN(val) || val < 0) {
        //         ctx.addIssue({
        //             code: z.ZodIssueCode.custom,
        //             message: 'Lương net phải là số dương',
        //             path: ['netSalary'],
        //         });
        //     }
        // }

        // if (data.grossSalary) {
        //     const val = Number(data.grossSalary.replace(/[^\d]/g, ''));
        //     if (isNaN(val) || val < 0) {
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
// .optional(); // vẫn giữ .optional() cho toàn bộ salary nếu phù hợp


// Schema chính cho form (có key salary)
export const salaryFormSchema = z.object({
    salary: salaryInnerSchema,
});

export type SalaryFormValues = z.infer<typeof salaryFormSchema>;

export type SalaryInnerValues = z.infer<typeof salaryInnerSchema>;