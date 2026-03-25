import { BtnCancel } from "@/components/btn-cancel"
import { TitlePage } from "@/components/title-page"
import { icons } from "@/lib/icons"
import { addToast, Button } from "@heroui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { Form, FormProvider, useForm, useWatch } from "react-hook-form"
import { InsuranceAndUnionSection } from "../staff-detail/components/contract-and-salary-sections/insurance-and-union-section"
import { LeaveBenefitsSection } from "../staff-detail/components/contract-and-salary-sections/leave-benefits-section"
import { PersonalIncomeTaxSection } from "../staff-detail/components/contract-and-salary-sections/personal-income-tax-section"
import { SalaryInfoSection } from "../staff-detail/components/contract-and-salary-sections/salary-info-section"
import { SalaryStructureSection } from "../staff-detail/components/contract-and-salary-sections/salary-structure-section"
import { ControlMode, useControlMode } from "./hooks/use-control-mode-handle"
import { salaryFormSchema, type SalaryFormValues } from "./schemas"
import { usePatchDetailsStaffSalary, useSalaryDetailsQuery } from "@/services/query-options/staff-management.query"
import { useParams } from "@tanstack/react-router"
import { calculateSalary, mapApiToFormValues } from "./helpers"
import StaffContractEmptyState from "../staff-detail/components/staff-contract-empty-state"
import { LoadingWrapper } from "@/components/loading-wrapper"
import { BtnSave } from "@/components/btn-save"
import { NAMESPACES } from "@/i18n/constants"
import { useTranslation } from "react-i18next"

export const SalaryAndBenefits = () => {
    const { id } = useParams({ strict: false })
    const { mode, setMode } = useControlMode()
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT)
    const { mutate, isPending, isError } = usePatchDetailsStaffSalary();
    const { data, isLoading, refetch } = useSalaryDetailsQuery(id)

    const methods = useForm<SalaryFormValues>({
        resolver: zodResolver(salaryFormSchema),
        defaultValues: mapApiToFormValues({}), // khởi tạo rỗng ban đầu
        mode: 'onChange',
    })

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors },
        getValues,
        setValue,
        watch
    } = methods

    // Reset form khi data từ API thay đổi (view hoặc edit)
    useEffect(() => {
        if (!isLoading && data) {
            const formValues = mapApiToFormValues(data)
            reset(formValues)
        }
    }, [data, isLoading, reset])

    // Set mode mặc định là view khi mount
    useEffect(() => {
        setMode(ControlMode.view)
    }, [setMode])

    const salaryInputs = useWatch({
        control,
        name: [
            "salary.basicSalary",
            "salary.insuranceSalary",
            "salary.responsibilityAllowance",
            "salary.positionAllowance",
            "salary.hazardAllowance",
            "salary.mealAllowance",
            "salary.mealAllowanceUnit",
            "salary.fuelAllowance",
            "salary.phoneAllowance",
            "salary.businessTripAllowance",
            "salary.otherAllowance",
            "salary.hasHealthInsurance",
            "salary.healthInsuranceRate",
            "salary.hasSocialInsurance",
            "salary.socialInsuranceRate",
            "salary.hasUnemploymentInsurance",
            "salary.unemploymentInsuranceRate",
            "salary.hasUnionFee",
            "salary.unionFee",
            "salary.hasFamilyDeduction",
            "salary.dependentsCount",
            "salary.hasPersonalIncomeTax",
            "salary.personalIncomeTaxRate",
        ],
    });

    useEffect(() => {
        const result = calculateSalary({ salary: watch("salary") });

        setValue("salary.grossSalary", result?.grossSalary?.toString());
        setValue("salary.netSalary", result?.netSalary?.toString());
    }, [salaryInputs]);

    const onSubmit = handleSubmit(async (formData) => {
        if (!id) return addToast({
            description: t('salary_benefits.staff_not_found'),
            color: 'warning',
        });

        mutate(
            { id, payload: formData },
            {
                onSuccess: () => {
                    addToast({
                        description: t('salary_benefits.update_success'),
                        color: 'success',
                    });
                    setMode(ControlMode.view); // Tự động về mode view sau khi lưu
                    refetch();
                },
                onError: (error) => {
                    console.error('Error updating salary:', error);
                    addToast({
                        description: t('salary_benefits.update_error'),
                        color: 'danger',
                    });
                },
            }
        );
    });

    if (isLoading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <LoadingWrapper isLoading={isLoading}><div></div></LoadingWrapper>
            </div>
        )
    }

    if (!data?.data && id) {
        return <StaffContractEmptyState staffId={id} />
    }
    return (
        <FormProvider {...methods}>
            <Form onSubmit={() => onSubmit()} className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <TitlePage title={t('salary_benefits.title')} />

                    {mode === ControlMode.view ? (
                        <Button
                            variant="bordered"
                            color="primary"
                            startContent={<icons.edit width="20px" height="20px" stroke="#006FEE" />}
                            onPress={() => setMode(ControlMode.edit)}
                        >
                            {t('salary_benefits.edit')}
                        </Button>
                    ) : (
                        <div className="flex gap-2">
                            <BtnCancel
                                isDisabled={isPending}
                                onPress={() => setMode(ControlMode.view)}
                            />
                            <BtnSave isLoading={isPending} />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                    <div className="flex flex-col gap-6 pb-18">
                        <SalaryInfoSection />
                        <SalaryStructureSection />
                        <PersonalIncomeTaxSection />
                    </div>

                    <div className="flex flex-col gap-6">
                        <InsuranceAndUnionSection />
                        <LeaveBenefitsSection />
                    </div>
                </div>
            </Form>
        </FormProvider>
    )
}