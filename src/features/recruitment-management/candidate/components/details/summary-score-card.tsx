import { CRITERIA_EVALUATION } from "@/features/recruitment-management/constants/details";
import { ScoreBar } from "./criterion-card";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "@/i18n/constants";

export const SummaryScoreCard = ({ avgScore, watch }: { avgScore: number | null, watch: (name: string) => number | null }) => {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

    return <div className="bg-[#F4F4F5] w-full rounded-xl p-4 flex items-center gap-6">
        <div className="flex items-center gap-1 shrink-0 ">
            <span className="font-medium text-5xl text-primary leading-none">
                {avgScore !== null ? avgScore.toFixed(1) : '—'}
            </span>
            <span className="text-lg text-[#71717A] h-full">/10</span>
        </div>
        <div className="flex-1 flex flex-col gap-2">
            {CRITERIA_EVALUATION.map((c) => {
                const s = watch(c.scoreField as any) as number | null;
                return (
                    <div key={c.key} className="flex items-center gap-3">
                        <span className="text-sm text-[#3F3F46] w-24 shrink-0">
                            {t(c.labelKey)}
                        </span>
                        <div className="flex flex-1 items-center gap-1">
                            <ScoreBar score={s ?? 0} />
                            <span className="text-sm font-medium text-[#11181C]">
                                {s !== null ? s : '—'}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
}