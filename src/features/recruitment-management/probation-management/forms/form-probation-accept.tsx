import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input } from '@heroui/react';

import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { BtnCancel } from '@/components/btn-cancel';
import { BtnSave } from '@/components/btn-save';
import { FormCheckbox } from '@/components/form-fields/form-checkbox';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormInput } from '@/components/form-fields/form-input';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { useDepartmentOptions } from '@/hooks/options/use-department-options';
import { contractTypeOptions } from '@/features/staff-management/staff-list-management/constants/constants';

import { useFormProbationAccept } from '../hooks/use-form-probation-accept';
import { useDirtyDrawer } from '@/hooks/use-dirty-drawer';

interface DrawerData {
    probationId: string;
    employeeCode?: string;
    employeeName?: string;
    jobTitleName?: string;
}

const CHECKLIST_ITEMS = [
    {
        completedField: 'onboardingDocumentsCompleted' as const,
        labelKey: 'probation.form.checklist.documents',
        descKey: 'probation.form.checklist.documents_desc',
    },
    {
        completedField: 'onboardingContractSigned' as const,
        labelKey: 'probation.form.checklist.contract',
        descKey: 'probation.form.checklist.contract_desc',
    },
    {
        completedField: 'onboardingSystemAccountCreated' as const,
        labelKey: 'probation.form.checklist.system_account',
        descKey: 'probation.form.checklist.system_account_desc',
    },
    {
        completedField: 'onboardingStaffCardIssued' as const,
        labelKey: 'probation.form.checklist.staff_card',
        descKey: 'probation.form.checklist.staff_card_desc',
    },
    {
        completedField: 'onboardingUniformIssued' as const,
        labelKey: 'probation.form.checklist.uniform',
        descKey: 'probation.form.checklist.uniform_desc',
    },
    {
        completedField: 'onboardingOrientationCompleted' as const,
        labelKey: 'probation.form.checklist.orientation',
        descKey: 'probation.form.checklist.orientation_desc',
    },
] as const;

export function FormProbationAccept() {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const onClose = useDrawer((s) => s.onClose);
    const drawerData = useDrawer((s) => s.data) as DrawerData | undefined;

    const { probationId = '', employeeCode, jobTitleName } = drawerData ?? {};

    const { methods, isSubmitting, onSubmit } = useFormProbationAccept({
        probationId,
        onSuccess: onClose,
    });
    useDirtyDrawer(methods.formState.isDirty);

    const { control } = methods;
    const { options: departmentOptions } = useDepartmentOptions();

    return (
        <div className="relative h-full overflow-hidden bg-[#FAFAFA]">
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-[#F4F4F5]">
                <h2 className="text-2xl font-bold text-[#11181C]">
                    {t('probation.form.title' as any)}
                </h2>
            </div>

            <FormProvider {...methods}>
                <form
                    onSubmit={onSubmit}
                    className="flex flex-col gap-4 overflow-y-auto p-6 h-[calc(100vh-136px)]"
                >
                    {/* Employee Info Section */}
                    <div className="bg-white rounded-2xl p-5 flex flex-col gap-5">
                        <h3 className="text-base font-semibold text-[#11181C]">
                            {t('probation.form.sections.employee_info' as any)}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                isReadOnly
                                label={t('probation.form.fields.code' as any)}
                                labelPlacement="outside-top"
                                value={employeeCode ?? ''}
                                placeholder={t('probation.form.fields.code_placeholder' as any)}
                                classNames={{ inputWrapper: 'bg-[#F4F4F5] cursor-default' }}
                            />
                            <FormDatePicker
                                control={control}
                                name="officialStartDate"
                                label={t('probation.form.fields.official_start_date' as any)}
                                isRequired
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect
                                control={control}
                                name="departmentId"
                                label={t('probation.form.fields.department' as any)}
                                isRequired
                                options={departmentOptions}
                                placeholder={t('probation.form.fields.department_placeholder' as any)}
                            />
                            <Input
                                isReadOnly
                                label={t('probation.form.fields.job_title' as any)}
                                labelPlacement="outside-top"
                                value={jobTitleName ?? ''}
                                placeholder="—"
                                classNames={{ inputWrapper: 'bg-[#F4F4F5] cursor-default' }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect
                                control={control}
                                name="contractType"
                                label={t('probation.form.fields.contract_type' as any)}
                                isRequired
                                options={contractTypeOptions}
                                placeholder={t('probation.form.fields.contract_type_placeholder' as any)}
                            />
                            <FormNumberInput
                                control={control}
                                name="basicSalary"
                                label={t('probation.form.fields.official_salary' as any)}
                                placeholder={t('probation.form.fields.enter_salary' as any)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormInput
                                control={control}
                                name="email"
                                label={t('probation.form.fields.internal_email' as any)}
                                placeholder={t('probation.form.fields.enter_email' as any)}
                            />
                            <FormInput
                                control={control}
                                name="systemPermissions"
                                label={t('probation.form.fields.system_permissions' as any)}
                                placeholder={t('probation.form.fields.enter_system_permissions' as any)}
                            />
                        </div>
                    </div>

                    {/* Onboarding Checklist Section */}
                    <div className="bg-white rounded-2xl p-5 flex flex-col gap-4">
                        <h3 className="text-base font-semibold text-[#11181C]">
                            {t('probation.form.sections.checklist' as any)}
                        </h3>

                        {CHECKLIST_ITEMS.map((item) => (
                            <div key={item.completedField} className="flex items-start gap-3">
                                <FormCheckbox
                                    control={control}
                                    name={item.completedField}
                                    label={t(item.labelKey as any)}
                                />
                                <p className="text-xs text-[#71717A] mt-0.5">
                                    {t(item.descKey as any)}
                                </p>
                            </div>
                        ))}
                    </div>
                </form>
            </FormProvider>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-[#F4F4F5] px-6 py-4 flex justify-end gap-2 z-10">
                <BtnCancel isDisabled={isSubmitting} onPress={onClose} />
                <BtnSave isLoading={isSubmitting} onPress={() => onSubmit()} />
            </div>
        </div>
    );
}
