import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BtnCancel } from '@/components/btn-cancel';
import { BtnSave } from '@/components/btn-save';
import { LoadingWrapper } from '@/components/loading-wrapper';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';

import { useFormRecruitmentRequest } from '@/features/recruitment-management/recruitment-request-list/hooks/use-form-recruitment-request';
import { GeneralInfoSection } from './sections/general-info-section';
import { RecruitmentNeedSection } from './sections/recruitment-need-section';
import { JobDescriptionSection } from './sections/job-description-section';
import { CandidateRequirementsSection } from './sections/candidate-requirements-section';
import { SalaryBudgetSection } from './sections/salary-budget-section';
import { InternalNoteSection } from './sections/internal-note-section';
import { ControlMode, useControlMode } from '@/features/staff-management/salary-and-benefits/hooks/use-control-mode-handle';

interface DrawerData {
    id?: string;
}

const TITLE_BY_MODE: Record<ControlMode, string> = {
    [ControlMode.create]: 'recruitment_request.actions.create',
    [ControlMode.edit]: 'recruitment_request.actions.edit_request',
    [ControlMode.view]: 'recruitment_request.actions.view_detail',
};

export const FormRecruitmentRequestMutate = () => {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const onClose = useDrawer((s) => s.onClose);
    const drawerData = useDrawer((s) => s.data) as DrawerData | undefined;
    const id = drawerData?.id;
    const { mode, isView } = useControlMode();
    const { methods, isDetailLoading, isSubmitting, onSubmit } =
        useFormRecruitmentRequest({ id, onSuccess: onClose });

    const sectionProps = { isReadOnly: isView, variant: isView ? 'underlined' as const : undefined };

    return (
        <div className="relative h-full overflow-hidden bg-[#FAFAFA]">
            <div className="px-6 py-5 bg-white border-b border-[#F4F4F5]">
                <h2 className="text-2xl font-bold text-[#11181C]">
                    {t(TITLE_BY_MODE[mode] as any)}
                </h2>
            </div>

            <LoadingWrapper isLoading={isDetailLoading}>
                <FormProvider {...methods}>
                    <form
                        onSubmit={onSubmit}
                        className="flex flex-col gap-4 overflow-y-auto p-6 h-[calc(100vh-136px)]"
                    >
                        <GeneralInfoSection {...sectionProps} />
                        <RecruitmentNeedSection {...sectionProps} />
                        <JobDescriptionSection {...sectionProps} />
                        <CandidateRequirementsSection {...sectionProps} />
                        <SalaryBudgetSection {...sectionProps} />
                        <InternalNoteSection {...sectionProps} />
                    </form>
                </FormProvider>
            </LoadingWrapper>

            {!isView && (
                <div className="absolute bottom-0 left-0 w-full bg-white border-t border-[#F4F4F5] px-6 py-4 flex justify-end gap-2 z-10">
                    <BtnCancel isDisabled={isSubmitting} onPress={onClose} />
                    <BtnSave isLoading={isSubmitting} onPress={() => onSubmit()} />
                </div>
            )}
        </div>
    );
};
