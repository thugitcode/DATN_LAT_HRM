import { Avatar, Button } from '@heroui/react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BtnCancel } from '@/components/btn-cancel';
import { BtnSave } from '@/components/btn-save';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { useDirtyDrawer } from '@/hooks/use-dirty-drawer';
import { useFormProbationCreate } from '../hooks/use-form-probation-create';
import { ProbationStaffInfoSection } from '../components/sections/probation-staff-info-section';
import { ProbationSalarySection } from '../components/sections/probation-salary-section';
import { ProbationJobInfoSection } from '../components/sections/probation-job-info-section';
import { ProbationPeriodSection } from '../components/sections/probation-period-section';
import { ProbationQualificationSection } from '../components/sections/probation-qualification-section';
import { ProbationOnboardingSection } from '../components/sections/probation-onboarding-section';
import { ProbationNoteSection } from '../components/sections/probation-note-section';
import { LoadingWrapper } from '@/components/loading-wrapper';

interface DrawerData {
    id: string;
    name?: string;
    code?: string;
    position?: string;
    departmentName?: string;
    roomName?: string;
    email?: string;
    phone?: string;
}

export function FormCandidateProbationCreate() {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const onClose = useDrawer((s) => s.onClose);
    const drawerData = useDrawer((s) => s.data) as DrawerData | undefined;
    const {
        id: candidateId = '',
        name,
        code,
        position,
        departmentName,
    } = drawerData ?? {};

    const { methods, isSubmitting, isFetchingCandidate, onSubmit } = useFormProbationCreate({
        candidateId,
        onSuccess: onClose,
    });
    useDirtyDrawer(methods.formState.isDirty);

    return (
        <FormProvider {...methods}>
            <LoadingWrapper isLoading={isFetchingCandidate} className='h-50vh'>
                <div className="relative h-full flex flex-col overflow-hidden bg-[#FAFAFA]">
                    {/* ── Header ── */}
                    <div className="flex-none px-6 py-5 bg-white border-b border-[#F4F4F5]">
                        <h2 className="text-2xl font-bold text-[#11181C] mb-4">
                            {t('probation.form.title_create')}
                        </h2>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    name={name}
                                    size="md"
                                    className="flex-none"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-[#11181C]">
                                        {name ?? '—'}
                                    </span>
                                    <span className="text-xs text-[#71717A]">
                                        {[position, departmentName].filter(Boolean).join(' - ')}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="bordered"
                                color="primary"
                                size="sm"
                                className="rounded-xl border-1 text-xs font-medium whitespace-nowrap"
                            >
                                {t('probation.form.view_staff_profile' as any)}
                            </Button>
                        </div>
                    </div>
                    {/* ── Body ── */}
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <div className="grid grid-cols-2 gap-4 items-start">
                            {/* Left column */}
                            <div className="flex flex-col gap-4">
                                <ProbationStaffInfoSection code={code} />
                                <ProbationJobInfoSection />
                                <ProbationPeriodSection />
                            </div>
                            {/* Right column */}
                            <div className="flex flex-col gap-4">
                                <ProbationSalarySection />
                                <ProbationQualificationSection />
                                <ProbationOnboardingSection />
                                <ProbationNoteSection />
                            </div>
                        </div>
                    </div>
                    {/* ── Footer ── */}
                    <div className="flex-none flex items-center justify-end gap-3 px-6 py-4 bg-white border-t border-[#F4F4F5]">
                        <BtnCancel onPress={onClose} />
                        <BtnSave isLoading={isSubmitting} onClick={onSubmit} />
                    </div>
                </div>
            </LoadingWrapper>
        </FormProvider>
    );
}
