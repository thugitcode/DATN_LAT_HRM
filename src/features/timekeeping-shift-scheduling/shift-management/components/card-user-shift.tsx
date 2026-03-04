import { memo, useMemo, type FC } from 'react';
import { Accordion, AccordionItem } from '@heroui/react';

import { ShiftTypeEnum } from '@/types/shift-management.type';

import { formatWorkDate } from '../../helper';
import type { DepartmentWorkScheduleDetail } from '../types/type';
import { ShiftAvatar } from './shift-avatar';

const FLEXIBLE_SHIFT_TYPES = new Set([
  ShiftTypeEnum.FLEXIBLE,
  ShiftTypeEnum.SPLIT,
  ShiftTypeEnum.ON_DUTY,
]);

const ACCORDION_ITEM_CLASSES = {
  base: 'py-0 w-full',
  title: 'text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5',
  trigger: 'py-0 px-0 gap-0.5 h-[18px] hover:bg-transparent data-[hover=true]:bg-transparent',
  indicator: 'text-[#A1A1AA] w-3 h-3',
  content: 'pt-0.5 pb-1 pl-3',
} as const;

interface CardUserShiftProps {
  avatarUrl?: string | null;
  name?: string;
  code?: string;
  startTime?: string;
  endTime?: string;
  shiftTemplateName?: string;
  workDate?: string;
  departmentName?: string;
  department?: DepartmentWorkScheduleDetail[];
  type?: ShiftTypeEnum;
  standardHours?: string;
}

interface ItemListProps {
  items?: DepartmentWorkScheduleDetail[];
}

const formatStandardHours = (hours?: string): string => {
  if (!hours) return '';
  const num = parseFloat(hours);
  return isNaN(num) ? hours : String(num);
};

const ShiftTime: FC<Pick<CardUserShiftProps, 'type' | 'standardHours' | 'startTime' | 'endTime'>> =
  memo(({ type, standardHours, startTime, endTime }) => {
    const isFlexible = type !== undefined && FLEXIBLE_SHIFT_TYPES.has(type);

    return (
      <span className="text-base font-medium text-[#A1A1AA]">
        {isFlexible
          ? `${formatStandardHours(standardHours)} giờ`
          : `${startTime?.slice(0, 5)} - ${endTime?.slice(0, 5)}`}
      </span>
    );
  });

ShiftTime.displayName = 'ShiftTime';

export const ItemList: FC<ItemListProps> = memo(({ items }) => {
  const [first, ...rest] = items ?? [];

  if (!first) return null;

  if (!rest.length) {
    return <p className="text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5">{first.name}</p>;
  }

  return (
    <Accordion className="mt-0.5 px-0" itemClasses={ACCORDION_ITEM_CLASSES}>
      <AccordionItem
        key="1"
        title={
          <span className="flex items-center gap-1 min-w-0">
            <span className="truncate max-w-40" title={first.name}>
              {first.name}
            </span>
          </span>
        }
      >
        {rest.map(({ id, name }) => (
          <p key={id} className="text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5">
            {name}
          </p>
        ))}
      </AccordionItem>
    </Accordion>
  );
});

ItemList.displayName = 'ItemList';

export const CardUserShift: FC<Readonly<CardUserShiftProps>> = memo(
  ({
    avatarUrl,
    name,
    code,
    startTime,
    endTime,
    shiftTemplateName,
    workDate,
    departmentName,
    type,
    standardHours,
  }) => {
    const formattedWorkDate = useMemo(() => formatWorkDate(workDate), [workDate]);

    return (
      <div className="bg-white px-6 py-3">
        <div className="border border-[#11111126] rounded-xl overflow-hidden">
          <div className="bg-[#001731] p-3 text-white flex items-center justify-between">
            <div className="text-sm font-medium flex items-center gap-2">
              <ShiftAvatar avatarUrl={avatarUrl} name={name} />
              <div className="flex flex-col">
                <span className="text-base font-medium">{name}</span>
                <span className="text-xs text-[#A1A1AA]">
                  Mã nhân viên: <span>{code}</span>
                </span>
              </div>
            </div>
            <div className="text-[14px] font-medium">{departmentName}</div>
          </div>

          <div className="bg-white p-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl text-[#11181C] font-medium">{shiftTemplateName}</span>
              <ShiftTime
                type={type}
                standardHours={standardHours}
                startTime={startTime}
                endTime={endTime}
              />
            </div>
            <div className="text-base text-[#11181C] font-semibold">{formattedWorkDate}</div>
          </div>
        </div>
      </div>
    );
  },
);

CardUserShift.displayName = 'CardUserShift';
