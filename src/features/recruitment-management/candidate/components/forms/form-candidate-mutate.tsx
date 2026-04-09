import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Tab, Tabs } from '@heroui/react';

import { BtnCancel } from '@/components/btn-cancel';
import { BtnSave } from '@/components/btn-save';
import { LoadingWrapper } from '@/components/loading-wrapper';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import type { CandidateFormValues } from '../../schemas/candidate.schema';

import { useFormCandidate } from '../../hooks/use-form-candidate';
import { JobPositionSection } from '../sections/job-position-section';
import { PersonalInfoSection } from '../sections/personal-info-section';
import { PracticeCertificateSection } from '../sections/practice-certificate-section';
import { DocumentsSection } from '../sections/documents-section';
import { ProfessionalInfoSection } from '../sections/professional-info-section';

interface DrawerData {
    id?: string;
    recruitmentRequestId?: string;
}

export enum CandidateTabEnum {
    PERSONAL = 'personal',
    APPLICATION = 'application',
    QUALIFICATIONS = 'qualifications',
    ATTACHMENTS = 'attachments',
}

const TABS = [
    { key: CandidateTabEnum.PERSONAL, labelKey: 'candidate.form.tabs.personal_info' },
    { key: CandidateTabEnum.APPLICATION, labelKey: 'candidate.form.tabs.application' },
    { key: CandidateTabEnum.QUALIFICATIONS, labelKey: 'candidate.form.tabs.qualifications' },
    { key: CandidateTabEnum.ATTACHMENTS, labelKey: 'candidate.form.tabs.attachments' },
] as const;

const TAB_FIELDS: Record<CandidateTabEnum, (keyof CandidateFormValues)[]> = {
    [CandidateTabEnum.PERSONAL]: ['name', 'gender', 'phone', 'email', 'dateOfBirth', 'identityCard', 'address'],
    [CandidateTabEnum.APPLICATION]: ['departmentId', 'roomId', 'recruitmentRequestId', 'staffType', 'expectedSalaryFrom', 'expectedSalaryTo', 'source'],
    [CandidateTabEnum.QUALIFICATIONS]: ['school', 'major', 'educationLevel', 'academicTitle', 'experienceYears', 'note', 'practiceNumber', 'practiceIssueDate', 'practiceIssuePlace', 'practiceScope', 'practiceFileUrl'],
    [CandidateTabEnum.ATTACHMENTS]: ['documents'],
};

const TAB_KEYS = TABS.map((t) => t.key);

type TabKey = CandidateTabEnum;

export const FormCandidateMutate = () => {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const onClose = useDrawer((s) => s.onClose);
    const drawerData = useDrawer((s) => s.data) as DrawerData | undefined;
    const id = drawerData?.id;
    const recruitmentRequestId = drawerData?.recruitmentRequestId;
    const isEditMode = !!id;

    const [activeTab, setActiveTab] = useState<TabKey>(CandidateTabEnum.PERSONAL);

    const { methods, isDetailLoading, isSubmitting, onSubmit } = useFormCandidate({
        id,
        recruitmentRequestId,
        onSuccess: onClose,
    });

    const currentTabIndex = TAB_KEYS.indexOf(activeTab);
    const isLastTab = currentTabIndex === TAB_KEYS.length - 1;

    const handleContinue = async () => {
        const fields = TAB_FIELDS[activeTab];
        const valid = await methods.trigger(fields);
        if (valid && !isLastTab) {
            setActiveTab(TAB_KEYS[currentTabIndex + 1] as TabKey);
        }
    };

    return (
        <div className="relative h-full overflow-hidden bg-[#FAFAFA]">
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-[#F4F4F5]">
                <h2 className="text-2xl font-bold text-[#11181C]">
                    {isEditMode ? t('candidate.form.title.edit') : t('candidate.form.title.create')}
                </h2>
            </div>

            <LoadingWrapper isLoading={isDetailLoading}>
                <FormProvider {...methods}>
                    {/* Tabs */}
                    <div className="bg-white border-b border-[#F4F4F5] px-6">
                        <Tabs
                            aria-label="candidate-form-tabs"
                            variant="underlined"
                            color="primary"
                            selectedKey={activeTab}
                            onSelectionChange={(key) => setActiveTab(key as TabKey)}
                            classNames={{
                                base: 'bg-transparent',
                                tabList: 'p-0 gap-6',
                                tab: 'h-10 px-0 text-sm',
                                cursor: 'shadow-none',
                            }}
                        >
                            {TABS.map((tab) => (
                                <Tab key={tab.key} title={t(tab.labelKey as any)} />
                            ))}
                        </Tabs>
                    </div>

                    {/* Content */}
                    <form
                        onSubmit={onSubmit}
                        className="flex flex-col gap-4 overflow-y-auto p-6 h-[calc(100vh-200px)]"
                    >
                        {activeTab === CandidateTabEnum.PERSONAL && <PersonalInfoSection />}
                        {activeTab === CandidateTabEnum.APPLICATION && (
                            <div className="bg-white flex flex-col gap-4 p-5 rounded-2xl shadow-sm border border-[#E4E4E7] text-sm text-[#71717A]">
                                <JobPositionSection recruitmentRequestId={recruitmentRequestId} />
                            </div>
                        )}
                        {activeTab === CandidateTabEnum.QUALIFICATIONS && (
                            <>
                                <ProfessionalInfoSection />
                                <PracticeCertificateSection />
                            </>
                        )}
                        {activeTab === CandidateTabEnum.ATTACHMENTS && <DocumentsSection />}
                    </form>
                </FormProvider>
            </LoadingWrapper>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-[#F4F4F5] px-6 py-4 flex justify-end gap-2 z-10">
                <BtnCancel isDisabled={isSubmitting} onPress={onClose} />
                {isEditMode || isLastTab ? (
                    <BtnSave isLoading={isSubmitting} onPress={() => onSubmit()} />
                ) : (
                    <Button
                        color="primary"
                        className="font-medium rounded-xl"
                        onPress={handleContinue}
                    >
                        {t('candidate.form.btn_continue')}
                    </Button>
                )}
            </div>
        </div>
    );
};
