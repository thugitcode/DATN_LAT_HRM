import { cn } from "@/lib/utils";

export function ScoreBar({ score, classNames, maxScore = 10 }: { score: number | null, classNames?: { wrapper?: string, bar?: string }, maxScore?: number }) {
    const pct = score !== null ? Math.min(Math.max((score / maxScore) * 100, 0), 100) : 0;
    return (
        <div className={cn("flex-1 h-2 bg-[#E4E4E7] rounded-full overflow-hidden", classNames?.wrapper)}>
            <div className={cn("h-full bg-primary rounded-full transition-all", classNames?.bar)} style={{ width: `${pct}%` }} />
        </div>
    );
}