import type { FC } from 'react';

import type {
  AttendanceExplanationSummary,
  AttendanceExplanationTypeCount,
} from '@/types/attendance-explanation.type';

interface ExplanationSummaryProps {
  summary?: AttendanceExplanationSummary;
  explanationTypes?: AttendanceExplanationTypeCount[];
}

export const ExplanationSummary: FC<Readonly<ExplanationSummaryProps>> = ({
  explanationTypes,
  summary,
}) => {
  return <div className="bg-white rounded-xl p-6">ExplanationSummary</div>;
};
