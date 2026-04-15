import { useMemo } from "react";
import { NAMESPACES } from "@/i18n/constants";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { ProbationEvaluationFormValues } from "../schemas/probation-evaluation.schema";
import { useStaffOptions } from "@/hooks/options/use-staff-options";
import { FormArea } from "@/components/form-fields/form-area";
import { Button } from "@heroui/react";
import { FormSelect } from "@/components/form-fields/form-select";
import { SummaryScoreCard } from "@/features/recruitment-management/components/summary-score-card";

export function ResultEvaluationTab({
    avg,
    criteria,
    isSubmitting,
    onApprove,
    onExtend,
    onReject,
}: {
    avg: number | null;
    criteria: { label: string; score: number | null }[];
    isSubmitting: boolean;
    onApprove: () => void;
    onExtend: () => void;
    onReject: () => void;
}) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const { control } = useFormContext<ProbationEvaluationFormValues>();
    const { options: staffOptions } = useStaffOptions();


    return (
        <div className="flex flex-col gap-4">
            {/* Score summary */}
            <SummaryScoreCard avgScore={avg} criteria={criteria} variant="flat" />

            {/* Reviewer comments */}
            <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
                <p className="text-sm font-semibold text-[#11181C]">
                    {t('probation.evaluation_form.reviewer_comment_section')}
                </p>
                <FormArea
                    control={control}
                    name="generalComment"
                    label={t('probation.evaluation_form.general_comment')}
                    placeholder={t('probation.evaluation_form.enter_comment')}
                />
                <FormArea
                    control={control}
                    name="strengths"
                    label={t('probation.evaluation_form.strengths')}
                    placeholder={t('probation.evaluation_form.enter_comment')}
                />
                <FormArea
                    control={control}
                    name="improvementAreas"
                    label={t('probation.evaluation_form.improvement_areas')}
                    placeholder={t('probation.evaluation_form.enter_comment')}
                />
            </div>

            {/* Decision */}
            {/* <div className="bg-white rounded-xl p-4 flex flex-col gap-3">
                <p className="text-sm font-semibold text-[#11181C]">
                    {t('probation.evaluation_form.decision_section')}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button
                        color="primary"
                        className="rounded-xl text-sm font-medium"
                        isLoading={isSubmitting}
                        onPress={onApprove}
                    >
                        {t('probation.evaluation_form.decision_approve')}
                    </Button>
                    <Button
                        variant="bordered"
                        color="primary"
                        className="rounded-xl text-sm font-medium border-1"
                        isLoading={isSubmitting}
                        onPress={onExtend}
                    >
                        {t('probation.evaluation_form.decision_extend')}
                    </Button>
                    <Button
                        variant="bordered"
                        color="danger"
                        className="rounded-xl text-sm font-medium border-1"
                        isLoading={isSubmitting}
                        onPress={onReject}
                    >
                        {t('probation.evaluation_form.decision_reject')}
                    </Button>
                </div>
            </div> */}

            {/* Approver comment */}
            {/* <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
                <p className="text-sm font-semibold text-[#11181C]">
                    {t('probation.evaluation_form.approver_comment_section')}
                </p>
                <FormSelect
                    control={control}
                    name="approverId"
                    label={t('probation.evaluation_form.approver')}
                    options={staffOptions.map((s) => ({ key: s.key, label: s.label }))}
                    placeholder={t('probation.evaluation_form.approver')}
                />
                <FormArea
                    control={control}
                    name="approverComment"
                    label={t('probation.evaluation_form.approver_comment')}
                    placeholder={t('probation.evaluation_form.enter_comment')}
                />
            </div> */}
        </div>
    );
}
