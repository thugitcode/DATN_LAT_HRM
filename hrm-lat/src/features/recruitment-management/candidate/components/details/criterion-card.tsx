import { ScoreBar } from "@/components/score-bar";
import { icons } from "@/lib/icons";
import { Button } from "@heroui/react";

function CriterionCard({ label, score, evaluation, comment, onEdit }: {
    label: string;
    score: string | null;
    evaluation: string | null;
    comment: string | null;
    onEdit?: () => void;
}) {
    const scoreNum = score ? parseFloat(score) : null;

    return (
        <div className="border border-[#E4E4E7] rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-medium text-[#11181C]">{label}</p>
                    {evaluation && <p className="text-sm text-[#71717A] mt-0.5">{evaluation}</p>}
                </div>
                <Button
                    type="button"
                    isIconOnly
                    variant='bordered'
                    onPress={onEdit}
                >
                    <icons.edit />
                </Button>
            </div>

            {scoreNum !== null && (
                <div className="flex items-center gap-3">
                    <ScoreBar score={scoreNum} />
                    <span className="text-sm font-semibold text-primary w-8 text-right">{scoreNum}</span>
                </div>
            )}

            {comment && (
                <div className="flex items-start gap-2 bg-[#F4F4F5] rounded-lg px-3 py-2">
                    {icons.conversation}
                    <p className="text-sm text-[#3F3F46]">{comment}</p>
                </div>
            )}
        </div>
    );
}

export { CriterionCard }