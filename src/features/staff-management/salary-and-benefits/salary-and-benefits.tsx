import { BtnCancel } from "@/components/btn-cancel"
import { TitlePage } from "@/components/title-page"
import { Button } from "@heroui/react"
import { InsuranceAndUnionSection } from "../staff-detail/components/sections/insurance-and-union-section"
import { LeaveBenefitsSection } from "../staff-detail/components/sections/leave-benefits-section"
import { PersonalIncomeTaxSection } from "../staff-detail/components/sections/personal-income-tax-section"
import { SalaryInfoSection } from "../staff-detail/components/sections/salary-info-section"
import { SalaryStructureSection } from "../staff-detail/components/sections/salary-structure-section"
import { Form, FormProvider, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { salarySchema, type SalaryFormValues } from "./schemas"

export const SalaryAndBenefits = () => {

    const methods = useForm<SalaryFormValues>({
        resolver: zodResolver(salarySchema),
        defaultValues: {
            hasHealthInsurance: false,
            healthInsuranceRate: '',
            hasSocialInsurance: false,
            socialInsuranceRate: '',
            hasUnemploymentInsurance: false,
            unemploymentInsuranceRate: '',
            hasUnionFee: false,
            unionFee: '',
            hasHealthCareInsurance: false,
            healthCareInsuranceCompany: '',
            healthCareInsuranceBenefit: '',
            healthCareInsuranceRate: '',
            basicSalary: '',
            insuranceSalary: '',
            responsibilityAllowance: '',
            positionAllowance: '',
            hazardAllowance: '',
            mealAllowance: '',
            mealAllowanceUnit: 'DAY' as const,
            fuelAllowance: '',
            phoneAllowance: '',
            businessTripAllowance: '',
            otherAllowance: '',

            leaveQuotaIds: [],

            hasFamilyDeduction: false,
            dependentsCount: '',
            hasPersonalIncomeTax: true,
            personalIncomeTaxRate: '',
        },
        mode: 'onChange',
    });
    const onSubmit = (values: SalaryFormValues) => {
        console.log(values);

    }
    return (
        <FormProvider {...methods}>
            <Form
                onSubmit={() => onSubmit()}
                className="flex flex-col gap-4"
            >
                <div className="flex justify-between">
                    <TitlePage title="Lương và phúc lợi" />
                    <div className="flex gap-2">
                        <BtnCancel />
                        {/* <BtnCancel isDisabled={isSubmitting} onPress={onClose} /> */}
                        <Button
                            type="submit"
                            color="primary"
                        // onClick={onSubmit}
                        // isLoading={isSubmitting}
                        >
                            Lưu lại
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full"
                >
                    <div className="flex flex-col gap-6 pb-18">
                        <SalaryInfoSection />
                        <SalaryStructureSection />
                        <PersonalIncomeTaxSection />
                        {/* Sau này thêm: WorkingAreaSection, InsuranceSection, ... */}
                    </div>

                    <div className="flex flex-col gap-6">
                        {/* Các section bên phải sẽ thêm sau */}
                        <InsuranceAndUnionSection />
                        <LeaveBenefitsSection />
                    </div>
                </div>
            </Form>
        </FormProvider>
    )
}