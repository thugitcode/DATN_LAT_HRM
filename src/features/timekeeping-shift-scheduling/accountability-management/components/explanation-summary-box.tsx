import type { FC } from 'react';

interface ExplanationSummaryBoxProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  color: string;
  bgColor: string;
}

export const ExplanationSummaryBox: FC<Readonly<ExplanationSummaryBoxProps>> = ({
  icon,
  label,
  count = 0,
  color,
  bgColor,
}) => (
  <div
    className="flex flex-col items-start gap-1 rounded-lg px-4 py-2"
    style={{ backgroundColor: bgColor }}
  >
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-base font-medium text-black whitespace-nowrap">{label}</span>
    </div>
    <span className="text-2xl font-medium" style={{ color }}>
      {count}
    </span>
  </div>
);
