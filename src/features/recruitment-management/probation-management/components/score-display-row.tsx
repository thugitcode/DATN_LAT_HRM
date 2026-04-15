import { ScoreBar } from "@/components/score-bar";

export function ScoreDisplayRow({ label, score }: { label: string; score: number | null }) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-[#52525B] w-28 shrink-0">{label}</span>
            <ScoreBar score={score} />
            <span className="text-sm font-semibold text-primary w-8 text-right">
                {score !== null ? score : '—'}
            </span>
        </div>
    );
}