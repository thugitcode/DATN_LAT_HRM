import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@heroui/react';

import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { BtnCancel } from '@/components/btn-cancel';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { FormSelect } from '@/components/form-fields/form-select';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormFileUploadInput } from '@/components/form-fields/form-file-upload-input';
import { FormArea } from '@/components/form-fields/form-area';
import { useDepartmentOptions } from '@/hooks/select-options/use-department-options';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { formatVND } from '@/lib/helpers';

import { useFormOffer } from '../../hooks/use-form-offer';
import { CandidateStatusSelect } from './candidate-status-select';
import { CandidateStatusEnum } from '@/features/recruitment-management/recruitment-request-details/types/type';
import { useState } from 'react';
import { FormInput } from '@/components/form-fields/form-input';

interface DrawerData {
    candidateId: string;
    candidateName?: string;
    candidatePosition?: string;
    candidateDepartment?: string;
    candidateStatus?: string;
}

export function FormOfferMutate() {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const onClose = useDrawer((s) => s.onClose);
    const drawerData = useDrawer((s) => s.data) as DrawerData;
    const { candidateId, candidateName, candidatePosition, candidateDepartment, candidateStatus } = drawerData ?? {};
    const [status, setStatus] = useState<CandidateStatusEnum>(candidateStatus as CandidateStatusEnum)

    const { methods, isSubmitting, onSubmitDraft, onSubmitSend, totalIncome } = useFormOffer({
        candidateId,
        onSuccess: onClose,
    });

    const { control } = methods;
    const { options: departmentOptions } = useDepartmentOptions();
    const { options: staffOptions } = useStaffOptions();

    return (
        <div className="relative h-full overflow-hidden bg-[#FAFAFA]">
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-[#F4F4F5]">
                <h2 className="text-2xl font-bold text-[#11181C]">
                    {t('candidate.offer.title')}
                </h2>
            </div>

            <FormProvider {...methods}>
                {/* Candidate info */}


                {/* Form */}
                <div className="flex flex-col gap-4 overflow-y-auto p-6 h-[calc(100vh-145px)]">
                    {candidateName && (
                        <div className="bg-white rounded-xl px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                    {candidateName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-[#11181C]">{candidateName}</p>
                                    {(candidatePosition || candidateDepartment) && (
                                        <p className="text-sm text-[#71717A]">
                                            {[candidatePosition, candidateDepartment].filter(Boolean).join(' · ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <CandidateStatusSelect candidateId={candidateId} status={status} onSelect={setStatus} />
                        </div>
                    )}
                    <div className="bg-white rounded-2xl p-5 flex flex-col gap-5">
                        {/* Row 1: position + department */}
                        <div className="grid grid-cols-2 gap-4">
                            {/* <FormSelect
                                control={control}
                                name="offerPosition"
                                label={t('candidate.offer.fields.position')}
                                isRequired
                                options={[]}
                                placeholder={t('candidate.offer.fields.position')}
                            /> */}
                            <FormInput
                                control={control}
                                name="offerPosition"
                                label={t('candidate.offer.fields.position')}
                                isRequired
                                placeholder={t('candidate.offer.fields.position')}
                            />
                            <FormSelect
                                control={control}
                                name="offerDepartment"
                                label={t('candidate.offer.fields.department')}
                                isRequired
                                options={departmentOptions.map((d) => ({ key: d.label, label: d.label }))}
                                placeholder={t('candidate.offer.fields.department')}
                            />
                        </div>

                        {/* Row 2: base salary + allowance */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormNumberInput
                                control={control}
                                name="baseSalary"
                                label={t('candidate.offer.fields.base_salary')}
                                isRequired
                                placeholder="Nhập"
                            />
                            <FormNumberInput
                                control={control}
                                name="allowance"
                                label={t('candidate.offer.fields.allowance')}
                                placeholder="Nhập"
                            />
                        </div>

                        {/* Row 3: special allowance + total income */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormNumberInput
                                control={control}
                                name="specialAllowance"
                                label={t('candidate.offer.fields.special_allowance')}
                                placeholder="Nhập"
                            />
                            <Input
                                isReadOnly
                                label={t('candidate.offer.fields.total_income')}
                                labelPlacement="outside-top"
                                value={totalIncome > 0 ? formatVND(totalIncome) : ''}
                                placeholder="—"
                                classNames={{ inputWrapper: 'bg-[#F4F4F5] cursor-default' }}
                            />
                        </div>

                        {/* Row 4: start date + probation months */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormDatePicker
                                control={control}
                                name="offerStartDate"
                                label={t('candidate.offer.fields.start_date')}
                                isRequired
                            />
                            <FormNumberInput
                                control={control}
                                name="probationMonths"
                                label={t('candidate.offer.fields.probation_months')}
                                placeholder="Nhập"
                            />
                        </div>

                        {/* Row 5: approver */}
                        <FormSelect
                            control={control}
                            name="offerApproverId"
                            label={t('candidate.offer.fields.approver')}
                            isRequired
                            options={staffOptions.map((s) => ({ key: s.key, label: s.label }))}
                            placeholder={t('candidate.offer.fields.approver')}
                        />

                        {/* File upload */}
                        <FormFileUploadInput
                            control={control}
                            name="offerDocumentFile"
                            label={t('candidate.offer.fields.document')}
                            accept=".pdf"
                            maxSize={1 * 1024 * 1024}
                            multiple={false}
                        />

                        {/* Notes
                        <FormArea
                            control={control}
                            name="offerNotes"
                            label={t('candidate.offer.fields.notes')}
                            placeholder="Nhập ghi chú..."
                            minRows={3}
                        /> */}
                    </div>
                </div>
            </FormProvider>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-[#F4F4F5] px-6 py-4 flex justify-end gap-2 z-10">
                <BtnCancel isDisabled={isSubmitting} onPress={onClose} className='border-1' />
                <Button
                    variant="bordered"
                    color="primary"
                    className="font-medium rounded-xl border-1"
                    isLoading={isSubmitting}
                    onPress={() => onSubmitDraft()}
                >
                    {t('candidate.offer.save_draft')}
                </Button>
                <Button
                    color="primary"
                    className="font-medium rounded-xl"
                    isLoading={isSubmitting}
                    onPress={() => onSubmitSend()}
                >
                    {t('candidate.offer.send')}
                </Button>
            </div>
        </div>
    );
}
