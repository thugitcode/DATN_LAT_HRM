import { memo, type FC } from 'react';
import { Accordion, AccordionItem } from '@heroui/accordion';

import type { StaffPosition } from '@/types/global.type';

import { STAFF_POSITION } from '../shift-management/constants/data';
import { StaffAvatar } from './staff-avatar';

interface Room {
  id: string;
  name: string;
}

interface Department {
  id: string;
  name: string;
  rooms?: Room[];
}

interface StaffInfoProps {
  avatarUrl?: string | null;
  name?: string;
  role?: StaffPosition;
  code?: string;
  departmentName?: string;
  departments?: Department[];
  rooms?: Room[];
}

export const StaffInfo: FC<Readonly<StaffInfoProps>> = memo(
  ({ avatarUrl, code, name, role, departments = [], rooms = [] }) => {
    return (
      <div className="flex items-start gap-2 min-w-0 py-0.5 w-full" title={name}>
        <StaffAvatar avatarUrl={avatarUrl} name={name} />

        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-[#18181C] leading-tight truncate">{name}</p>

          <p className="text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5">
            {role && STAFF_POSITION?.[role]}
            {role && code && <span aria-hidden>-</span>}
            {code}
          </p>

          {rooms?.length === 1 ? (
            <p className="text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5">
              {rooms?.[0]?.name}
            </p>
          ) : (
            <Accordion
              className="mt-0.5 px-0"
              itemClasses={{
                base: 'py-0 w-full',
                title: 'text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5',
                trigger:
                  'py-0 px-0 gap-0.5 h-[18px] hover:bg-transparent data-[hover=true]:bg-transparent',
                indicator: 'text-[#A1A1AA] w-3 h-3',
                content: 'pt-0.5 pb-1 pl-3',
              }}
            >
              <AccordionItem
                key={'1'}
                title={
                  <span className="flex items-center gap-1 min-w-0">
                    <span className="truncate max-w-40" title={rooms?.[0]?.name}>
                      {rooms?.[0]?.name}
                    </span>
                  </span>
                }
              >
                {rooms.slice(1).map((dept) => (
                  <p className="text-xs text-[#A1A1AA] whitespace-nowrap leading-4.5">
                    {dept?.name}
                  </p>
                ))}
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </div>
    );
  },
);

StaffInfo.displayName = 'StaffInfo';
