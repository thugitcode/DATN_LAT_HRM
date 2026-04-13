import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { BtnCancel } from '@/components/btn-cancel';
import { BtnSave } from '@/components/btn-save';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormSelect } from '@/components/form-fields/form-select';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';

import type { CandidateStatusEnum, ICandidate } from '@/features/recruitment-management/recruitment-request-details/types/candidate.type';
import type { CriterionKey } from '@/features/recruitment-management/types/candidate.type';
import { useFormEvaluation } from '../../hooks/use-form-evaluation';
import { useDirtyDrawer } from '@/hooks/use-dirty-drawer';
import { CandidateStatusSelect } from '../details/candidate-status-select';
import { ScoreBar } from '../details/criterion-card';
import { CriterionEditCard } from '../details/criterion-edit-card';
import { CRITERIA_EVALUATION } from '@/features/recruitment-management/constants/details';
import { SummaryScoreCard } from '../details/summary-score-card';

interface DrawerData {
    candidateId: string;
    candidate?: ICandidate;
}

export function FormEvaluationMutate() {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const onClose = useDrawer((s) => s.onClose);
    const drawerData = useDrawer((s) => s.data) as DrawerData;
    const { candidateId, candidate } = drawerData ?? {};

    const [editingKey, setEditingKey] = useState<CriterionKey | null>(null);
    const [status, setStatus] = useState(candidate?.status);

    const { methods, isSubmitting, onSubmit } = useFormEvaluation({
        candidateId,
        candidate,
        onSuccess: onClose,
    });
    useDirtyDrawer(methods.formState.isDirty);

    const { control, watch } = methods;
    const { options: staffOptions } = useStaffOptions();

    const scores = CRITERIA_EVALUATION.map((c) => {
        const v = watch(c.scoreField) as number | null;
        return v !== null ? v : null;
    }).filter((s): s is number => s !== null);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    const candidateName = candidate?.name ?? '';

    return (
        <div className="relative h-full overflow-hidden bg-[#FAFAFA]">
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-[#F4F4F5]">
                <h2 className="text-2xl font-bold text-[#11181C]">
                    {t('candidate.evaluation.title')}
                </h2>
            </div>

            <FormProvider {...methods}>
                <div className="flex flex-col gap-4 overflow-y-auto p-6 h-[calc(100vh-145px)]">
                    {/* Candidate info card */}
                    {candidateName && (
                        <div className="bg-white rounded-xl px-6 py-6 flex flex-col items-center justify-between gap-6">
                            <div className='flex justify-start w-full'>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                        {candidateName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-[#11181C]">{candidateName}</p>
                                        {(candidate?.recruitmentRequest?.position || candidate?.recruitmentRequest?.department?.name) && (
                                            <p className="text-sm text-[#71717A]">
                                                {[
                                                    candidate.recruitmentRequest.position,
                                                    candidate.recruitmentRequest.department?.name,
                                                ]
                                                    .filter(Boolean)
                                                    .join(' - ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {status && (
                                    <CandidateStatusSelect
                                        candidateId={candidateId}
                                        status={status as CandidateStatusEnum}
                                        onSelect={(s) => setStatus(s)}
                                    />
                                )}
                            </div>
                            {/* Summary score card */}
                            <SummaryScoreCard avgScore={avgScore} watch={watch} />
                        </div>
                    )}


                    {/* Reviewer + interview date */}
                    <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect
                                control={control}
                                name="reviewerId"
                                label={t('candidate.detail.evaluation.reviewer')}
                                isRequired
                                options={staffOptions.map((s) => ({ key: s.key, label: s.label }))}
                                placeholder={t('candidate.detail.evaluation.reviewer')}
                            />
                            <FormDatePicker
                                control={control}
                                name="interviewDate"
                                label={t('candidate.detail.evaluation.interview_date')}
                                isRequired
                            />
                        </div>
                    </div>

                    {/* Criterion cards */}
                    <div className="flex flex-col gap-3">
                        {CRITERIA_EVALUATION.map((c) => (
                            <CriterionEditCard
                                key={c.key}
                                config={c}
                                isEditing={editingKey === c.key}
                                onEdit={() => setEditingKey(c.key)}
                                onCancel={() => setEditingKey(null)}
                                onSave={() => setEditingKey(null)}
                            />
                        ))}
                    </div>
                </div>
            </FormProvider>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-[#F4F4F5] px-6 py-4 flex justify-end gap-2 z-10">
                <BtnCancel isDisabled={isSubmitting} onPress={onClose} className="border-1" />
                <BtnSave isLoading={isSubmitting} onPress={() => onSubmit()}>
                    {t('candidate.evaluation.btn_save')}
                </BtnSave>
            </div>
        </div>
    );
}
