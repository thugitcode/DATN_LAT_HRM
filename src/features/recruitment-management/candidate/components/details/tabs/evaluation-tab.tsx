import { useTranslation } from 'react-i18next';

import { criteria } from '@/features/recruitment-management/constants/constants';
import type { ICandidate } from '@/features/recruitment-management/recruitment-request-details/types/type';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';
import { formatDate } from '@/lib/utils';
import { CriterionCard, ScoreBar } from '../criterion-card';

interface EvaluationTabProps {
    candidate: ICandidate;
}

interface CriterionConfig {
    labelKey: string;
    score: string | null;
    evaluation: string | null;
    comment: string | null;
}



export function EvaluationTab({ candidate }: EvaluationTabProps) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const scores = criteria(candidate, t)
        .map((c) => (c.score ? parseFloat(c.score) : null))
        .filter((s): s is number => s !== null);

    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

    const hasEvaluation =
        candidate.reviewer ||
        candidate.interviewDate ||
        candidate.interviewComment ||
        scores.length > 0;

    if (!hasEvaluation) {
        return <p className="text-sm text-[#71717A]">{t('candidate.detail.no_data')}</p>;
    }

    return (
        <div className="flex flex-col gap-5">
            {/* Summary Score Card */}
            <div className="bg-[#F4F4F5] rounded-xl p-4 flex flex-col gap-4">
                <div className="flex items-center gap-6">
                    {/* Average score */}
                    <div className="flex items-end gap-1 shrink-0">
                        <span className="text-5xl font-bold text-primary leading-none">
                            {avgScore !== null ? avgScore.toFixed(1) : '—'}
                        </span>
                        <span className="text-lg text-[#71717A] mb-1">/10</span>
                    </div>

                    {/* Score bars */}
                    <div className="flex-1 flex flex-col gap-2">
                        {criteria(candidate, t)?.map((c) => {
                            const s = c.score ? parseFloat(c.score) : null;
                            return (
                                <div key={c.labelKey} className="flex items-center gap-3">
                                    <span className="text-sm text-[#3F3F46] w-24 shrink-0">{c.labelKey}</span>
                                    <ScoreBar score={s ?? 0} />
                                    <span className="text-sm font-medium text-[#11181C] w-8 text-right">
                                        {s !== null ? s : '—'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reviewer + Interview date */}
                <div className="flex gap-8 border-t border-[#E4E4E7] pt-3">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-[#71717A]">{t('candidate.detail.evaluation.reviewer')}</span>
                        <span className="text-sm font-medium text-[#11181C]">
                            {candidate.reviewer?.name ?? '—'}
                        </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-[#71717A]">{t('candidate.detail.evaluation.interview_date')}</span>
                        <span className="text-sm font-medium text-[#11181C]">
                            {candidate.interviewDate ? formatDate(candidate.interviewDate) : '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* General comment */}
            {candidate.interviewComment && (
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-[#71717A]">{t('candidate.detail.evaluation.general_comment')}</span>
                    <p className="text-sm text-[#11181C] leading-relaxed">{candidate.interviewComment}</p>
                </div>
            )}

            {/* Detailed evaluation */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                    {icons.medalRibonStar}
                    <span className="font-medium text-lg leading-7">{t('candidate.detail.evaluation.title')}</span>
                </div>
                <div className="flex flex-col gap-3">
                    {criteria(candidate, t)?.map((c) => (
                        <CriterionCard
                            key={c.labelKey}
                            label={c.labelKey}
                            score={c.score}
                            evaluation={c.evaluation}
                            comment={c.comment}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
