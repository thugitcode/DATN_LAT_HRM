import type { FC } from 'react';
import type { TFunction } from 'i18next';
import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

import type {
  AttendanceExplanationSummary,
  AttendanceExplanationTypeCount,
} from '@/types/attendance-explanation.type';
import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

import { ExplanationSummaryBox } from './explanation-summary-box';
import { ExplanationTypeRow } from './explanation-type-row';

interface ExplanationSummaryProps {
  summary?: AttendanceExplanationSummary | null;
  explanationTypes?: AttendanceExplanationTypeCount[] | null;
  showLabel?: boolean;
}

const GRID_COLS = 3;
const VERTICAL_DIVIDER = <div className="w-px h-8 bg-[#E4E4E7] shrink-0" />;

type SummaryKey = keyof Pick<
  AttendanceExplanationSummary,
  'totalRequests' | 'approved' | 'rejected' | 'pending'
>;


const getSummaryBadges = (t: TFunction<typeof NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING>) => [
  {
    key: 'totalRequests' as SummaryKey,
    icon: icons.questionCircle,
    label: t('explanation_management.summary.total'),
    color: '#006FEE',
    bgColor: '#E6F1FE',
  },
  {
    key: 'approved' as SummaryKey,
    icon: <icons.tickCircle />,
    label: t('explanation_management.summary.approved'),
    color: '#17C964',
    bgColor: '#E8FAF0',
  },
  {
    key: 'rejected' as SummaryKey,
    icon: <icons.closeSquare />,
    label: t('explanation_management.summary.rejected'),
    color: '#F31260',
    bgColor: '#FEE7EF',
  },
  {
    key: 'pending' as SummaryKey,
    icon: <icons.refreshCircle />,
    label: t('explanation_management.summary.pending'),
    color: '#F5A524',
    bgColor: '#FEF4E6',
  },
];

export const ExplanationSummary: FC<Readonly<ExplanationSummaryProps>> = ({
  summary,
  explanationTypes = [],
  showLabel = true,
}) => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);

  const summaryBadges = getSummaryBadges(t);

  const types = explanationTypes ?? [];
  const maxCount = Math.max(...types.map((t) => t.count), 0);

  const remainder = types.length % GRID_COLS;
  const paddedTypes: (AttendanceExplanationTypeCount | null)[] = [
    ...types,
    ...Array(remainder === 0 ? 0 : GRID_COLS - remainder).fill(null),
  ];

  return (
    <div
      className={cn(
        !showLabel ? 'rounded-b-xl' : 'rounded-xl',
        'flex flex-wrap items-stretch gap-6 bg-white p-5',
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        {showLabel && (
          <span className="text-2xl font-semibold text-[#11181C] whitespace-nowrap">
            {t('explanation_management.summary.label')}
          </span>
        )}

        <div className="flex flex-wrap items-center gap-4">
          {summaryBadges.map(({ key, icon, label, color, bgColor }, index) => (
            <div key={key} className="flex items-center gap-4">
              {index !== 0 && VERTICAL_DIVIDER}
              <ExplanationSummaryBox
                icon={icon}
                label={label}
                count={summary?.[key]}
                color={color}
                bgColor={bgColor}
              />
            </div>
          ))}
        </div>
      </div>

      {types.length > 0 && <div className="max-xl:hidden w-px bg-[#E4E4E7]" />}

      {types.length > 0 && (
        <div className="grid grid-cols-3 gap-x-8 gap-y-2 flex-1 min-w-0 content-start">
          {paddedTypes.map((type, index) =>
            type ? (
              <ExplanationTypeRow
                key={type.type}
                explanationType={type.type!}
                count={type.count}
                maxCount={maxCount}
              />
            ) : (
              <div key={`empty-${index}`} aria-hidden />
            ),
          )}
        </div>
      )}
    </div>
  );
};
