import { memo, type FC } from 'react';

import type { LegendItem } from '../types/index.type';

const LegendDot = memo(({ color, shape = 'circle' }: Pick<LegendItem, 'color' | 'shape'>) => {
  if (shape === 'ring') {
    return (
      <span
        className="inline-block shrink-0 size-4.75"
        style={{
          borderRadius: '45%',
          border: '1.5px solid #E0E0E0',
          backgroundColor: '#F4F4F5',
        }}
      />
    );
  }
  if (shape === 'line') {
    return (
      <span
        className="inline-block shrink-0 "
        style={{
          color: color,
        }}
      >
        --
      </span>
    );
  }
  return (
    <span
      className="inline-block shrink-0 size-4.75"
      style={{
        borderRadius: '45%',
        backgroundColor: color,
      }}
    />
  );
});

LegendDot.displayName = 'LegendDot';

const LegendBadge = memo(
  ({ item, showStatus = false }: { item: LegendItem; showStatus?: boolean }) => (
    <li className="flex items-center gap-1.5 text-xs text-gray-600 whitespace-nowrap">
      <LegendDot color={item.color} shape={item.shape} />
      <span className="text-sm text-black">
        {item.label} {showStatus && <>({item.status})</>}
      </span>
    </li>
  ),
);

LegendBadge.displayName = 'LegendBadge';

interface TimekeepingManagementLegendProps {
  legendItems: LegendItem[];
  showStatus?: boolean;
}

export const TimekeepingManagementLegend: FC<Readonly<TimekeepingManagementLegendProps>> = ({
  legendItems,
  showStatus,
}) => {
  return (
    <div className="h-20.5 px-6 flex items-center justify-end bg-white border-t border-[#11111126]">
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 ">
        {legendItems.map((item) => (
          <LegendBadge key={item.status} item={item} showStatus={showStatus} />
        ))}
      </ul>
    </div>
  );
};
