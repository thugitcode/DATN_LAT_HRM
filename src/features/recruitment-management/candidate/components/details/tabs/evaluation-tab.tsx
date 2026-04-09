import { useState } from 'react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@heroui/react';

import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormSelect } from '@/components/form-fields/form-select';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import type { ICandidate } from '@/features/recruitment-management/recruitment-request-details/types/type';
import { CRITERIA_EVALUATION } from '@/features/recruitment-management/constants/details';
import type { CriterionKey } from '@/features/recruitment-management/types/candidate.type';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';

import { useFormEvaluation } from '@/features/recruitment-management/candidate/hooks/use-form-evaluation';
import { useUpdateEvaluation } from '@/features/recruitment-management/candidate/hooks/use-update-evaluation';
import { CriterionEditCard } from '../criterion-edit-card';
import { ScoreBar } from '../criterion-card';
import { SummaryScoreCard } from '../summary-score-card';

interface EvaluationTabProps {
    candidate: ICandidate;
}

export function EvaluationTab({ candidate }: EvaluationTabProps) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const { options: staffOptions } = useStaffOptions();
    const [editingKey, setEditingKey] = useState<CriterionKey | null>(null);

    const { methods, onSubmit } = useFormEvaluation({ candidateId: candidate.id, candidate });
    const { control, watch } = methods;

    const { handleNext, handleWatchMore, handleReject, isPending } = useUpdateEvaluation(candidate.id);

    const scores = CRITERIA_EVALUATION.map((c) => {
        const v = watch(c.scoreField as any) as number | null;
        return v !== null ? v : null;
    }).filter((s): s is number => s !== null);

    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    const hasEvaluation =
        candidate.reviewer ||
        candidate.interviewDate ||
        candidate.interviewComment ||
        scores.length > 0;

    if (!hasEvaluation) {
        return (
            <div className="flex h-1/2 flex-col items-center gap-3 justify-center">
                <h3>{t('candidate.detail.evaluation.no_evaluation')}</h3>
                <FormProvider {...methods}>
                    <Button
                        color="primary"
                        onPress={() => {
                            setEditingKey('professional');
                        }}
                    >
                        {t('candidate.evaluation.btn_evaluate')}
                    </Button>
                </FormProvider>
            </div>
        );
    }

    return (
        <>
            <FormProvider {...methods}>
                <div className="flex flex-col gap-5">
                    {/* Score board header */}
                    <div className="flex items-center gap-2">
                        {icons.stars}
                        <span className="font-medium text-lg leading-7">
                            {t('candidate.detail.evaluation.score_board')}
                        </span>
                    </div>

                    {/* Summary score card */}
                    <SummaryScoreCard avgScore={avgScore} watch={watch} />

                    {/* Reviewer + interview date */}
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            control={control}
                            name="reviewerId"
                            label={t('candidate.detail.evaluation.reviewer')}
                            options={staffOptions.map((s) => ({ key: s.key, label: s.label }))}
                            placeholder={t('candidate.detail.evaluation.reviewer')}
                            onSelect={() => onSubmit()}
                        />
                        <FormDatePicker
                            control={control}
                            name="interviewDate"
                            label={t('candidate.detail.evaluation.interview_date')}
                            onTrigger={() => onSubmit()}
                        />
                    </div>

                    {/* Criterion cards */}
                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            {icons.medalRibonStar}
                            <span className="font-medium text-lg leading-7">
                                {t('candidate.detail.evaluation.title')}
                            </span>
                        </div>
                        {CRITERIA_EVALUATION.map((c) => (
                            <CriterionEditCard
                                key={c.key}
                                config={c}
                                isEditing={editingKey === c.key}
                                onEdit={() => setEditingKey(c.key)}
                                onCancel={() => setEditingKey(null)}
                                onSave={async () => { await onSubmit(); setEditingKey(null); }}
                            />
                        ))}
                    </div>

                    {/* Save button */}
                    {/* {isDirty && (
                    <div className="flex justify-end">
                        <Button
                            color="primary"
                            className="font-medium rounded-xl"
                            isLoading={isSubmitting}
                            onPress={() => onSubmit()}
                        >
                            {t('candidate.evaluation.btn_save')}
                        </Button>
                    </div>
                )} */}
                </div >
            </FormProvider>

            <div className="flex justify-start gap-3 mt-3">
                <Button
                    color="primary"
                    className="font-medium rounded-xl"
                    isLoading={isPending}
                    onPress={handleNext}
                >
                    {t('candidate.detail.evaluation.next_interview')}
                </Button>
                <Button
                    color="primary"
                    variant='bordered'
                    className="font-medium rounded-xl border-1"
                    isLoading={isPending}
                    onPress={handleWatchMore}
                >
                    {t('candidate.detail.evaluation.wait_for_more_evaluation')}
                </Button>
                <Button
                    color="danger"
                    variant='bordered'
                    className="font-medium rounded-xl border-1"
                    isLoading={isPending}
                    onPress={handleReject}
                >
                    {t('candidate.detail.evaluation.rejected')}
                </Button>
            </div>
        </>
    );
}
