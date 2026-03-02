import { memo, type FC } from 'react';
import { Accordion, AccordionItem } from '@heroui/react';

import { formatWorkDate } from '../../helper';
import type { DepartmentWorkScheduleDetail } from '../types/type';
import { ShiftAvatar } from './shift-avatar';

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
}

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
    department,
  }) => {
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

            {/* <ItemList items={department} /> */}
          </div>

          <div className="bg-white p-3 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl text-[#11181C] font-medium">{shiftTemplateName}</span>
              <span className="text-base font-medium text-[#A1A1AA]">
                {startTime?.slice(0, 5)} - {endTime?.slice(0, 5)}
              </span>
            </div>
            <div className="text-base text-[#11181C] font-semibold">{formatWorkDate(workDate)}</div>
          </div>
        </div>
      </div>
    );
  },
);

CardUserShift.displayName = 'CardUserShift';

interface ItemListProps {
  items?: DepartmentWorkScheduleDetail[];
}

const ACCORDION_ITEM_CLASSES = {
  base: 'py-0 w-full',
  title: 'text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5',
  trigger: 'py-0 px-0 gap-0.5 h-[18px] hover:bg-transparent data-[hover=true]:bg-transparent',
  indicator: 'text-[#A1A1AA] w-3 h-3',
  content: 'pt-0.5 pb-1 pl-3',
};

const ItemList: FC<ItemListProps> = ({ items }) => {
  if (!items?.length) return null;

  if (items?.length === 1) {
    return (
      <p className="text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5">{items?.[0]?.name}</p>
    );
  }

  return (
    <Accordion className="mt-0.5 px-0" itemClasses={ACCORDION_ITEM_CLASSES}>
      <AccordionItem
        key="1"
        title={
          <span className="flex items-center gap-1 min-w-0">
            <span className="truncate max-w-40" title={items?.[0]?.name}>
              {items?.[0]?.name}
            </span>
          </span>
        }
      >
        {items.slice(1).map((item) => (
          <p key={item.id} className="text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5">
            {item.name}
          </p>
        ))}
      </AccordionItem>
    </Accordion>
  );
};
