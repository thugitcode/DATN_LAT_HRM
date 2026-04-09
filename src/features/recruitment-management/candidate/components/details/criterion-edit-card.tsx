import { NAMESPACES } from "@/i18n/constants";
import { useController, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { EvaluationFormValues } from "../../schemas/evaluation.schema";
import { Button } from "@heroui/react";
import type { CriterionConfig } from "@/features/recruitment-management/types/candidate.type";
import { icons } from "@/lib/icons";
import { ScoreBar } from "./criterion-card";
import { FormArea } from "@/components/form-fields/form-area";

export function CriterionEditCard({
    config,
    isEditing,
    onEdit,
    onCancel,
    onSave,
}: {
    config: CriterionConfig;
    isEditing: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onSave: () => void | Promise<void>;
}) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const { control, watch } = useFormContext<EvaluationFormValues>();

    const { field: scoreField } = useController({ control, name: config.scoreField });

    const scoreValue = scoreField.value as number | null;
    const evaluationValue = (watch(config.evaluationField) ?? '') as string;
    const commentValue = (watch(config.commentField) ?? '') as string;

    const hasData = scoreValue !== null;

    if (isEditing) {
        return (
            <div className="border border-primary rounded-xl p-4 flex flex-col gap-3">
                <p className="font-medium text-[#11181C]">{t(config.labelKey)}</p>

                {/* Score slider */}
                <div className="flex items-center gap-3">
                    <span className="p text-lg leading-7 font-semibold w-[46px] h-[46px] rounded-xl flex items-center justify-center bg-[#F4F4F5]">
                        {scoreValue !== null ? scoreValue : 0}
                    </span>
                    <input
                        type="range"
                        min={0}
                        max={10}
                        step={0.5}
                        value={scoreValue ?? 0}
                        onChange={(e) => scoreField.onChange(Number(e.target.value))}
                        className="flex-1 accent-primary"
                    />
                </div>

                <FormArea
                    control={control}
                    name={config.evaluationField}
                    label={t('candidate.evaluation.fields.evaluation')}
                    placeholder={t('candidate.evaluation.fields.evaluation_placeholder')}
                    minRows={2}
                />

                <FormArea
                    control={control}
                    name={config.commentField}
                    label={t('candidate.evaluation.fields.comment')}
                    placeholder={t('candidate.evaluation.fields.comment_placeholder')}
                    minRows={2}
                />

                <div className="flex justify-end gap-2">
                    <Button variant="bordered" size="sm" className="rounded-lg" onPress={onCancel}>
                        {t('candidate.evaluation.btn_cancel')}
                    </Button>
                    <Button color="primary" size="sm" className="rounded-lg" onPress={onSave}>
                        {t('candidate.evaluation.btn_save_criterion')}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-[#E4E4E7] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-medium text-[#11181C]">{t(config.labelKey)}</p>
                    {evaluationValue && (
                        <p className="text-sm text-[#71717A] mt-0.5">{evaluationValue}</p>
                    )}
                </div>
                {hasData ? (
                    <Button type="button" isIconOnly variant="bordered" onPress={onEdit}>
                        <icons.edit />
                    </Button>
                ) : (
                    <Button
                        color="primary"
                        size="sm"
                        className="rounded-lg"
                        onPress={() => {
                            scoreField.onChange(0);
                            onEdit();
                        }}
                    >
                        {t('candidate.evaluation.btn_evaluate')}
                    </Button>
                )}
            </div>

            {hasData && (
                <>
                    <div className="flex items-center gap-3">
                        <span className="text-lg leading-7 font-semibold">
                            {scoreValue}
                        </span>
                        <ScoreBar score={scoreValue} />
                    </div>

                    {commentValue && (
                        <div className="flex items-start gap-2 bg-[#F4F4F5] rounded-lg px-3 py-2">
                            {icons.conversation}
                            <p className="text-sm text-[#3F3F46]">{commentValue}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}