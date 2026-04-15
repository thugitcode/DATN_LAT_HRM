import { ScoreDisplayRow } from '../probation-management/components/score-display-row';

export interface ScoreCriterion {
  label: string;
  score: number | null;
}

interface SummaryScoreCardProps {
  avgScore: number | null;
  criteria: ScoreCriterion[];
  variant?: 'flat' | 'circle';
  className?: string;
}

export function SummaryScoreCard({ avgScore, criteria, variant = 'flat', className }: SummaryScoreCardProps) {
  const bgClass = variant === 'circle' ? 'bg-white' : 'bg-[#F4F4F5]';

  return (
    <div className={`${bgClass} w-full rounded-xl p-4 flex items-center gap-6 ${className}`}>
      {variant === 'circle' ? (
        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-primary shrink-0">
          <span className="text-2xl font-bold text-primary leading-none">
            {avgScore !== null ? avgScore : '—'}
          </span>
          <span className="text-xs text-[#71717A]">/10</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 shrink-0">
          <span className="font-medium text-5xl text-primary leading-none">
            {avgScore !== null ? avgScore.toFixed(1) : '—'}
          </span>
          <span className="text-lg text-[#71717A]">/10</span>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-3">
        {criteria.map((c) => (
          <ScoreDisplayRow key={c.label} label={c.label} score={c.score} />
        ))}
      </div>
    </div>
  );
}
