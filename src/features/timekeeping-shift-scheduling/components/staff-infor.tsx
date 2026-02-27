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

// ─── Main ─────────────────────────────────────────────────────────────────────

export const StaffInfo: FC<Readonly<StaffInfoProps>> = memo(
  ({ avatarUrl, code, departmentName, name, role, departments, rooms }) => {
    const depts: Department[] = (() => {
      // Normalize departments
      const baseDepts: Department[] =
        departments && departments.length > 0
          ? departments
          : departmentName
            ? [{ id: 'legacy', name: departmentName }]
            : [];

      if (!baseDepts.length) return [];

      // Nếu departments chưa có rooms nào → gắn rooms prop vào dept đầu tiên
      const hasAnyRooms = baseDepts.some((d) => d.rooms && d.rooms.length > 0);
      if (!hasAnyRooms && rooms && rooms.length > 0) {
        return baseDepts.map((dept, i) => (i === 0 ? { ...dept, rooms } : dept));
      }

      return baseDepts;
    })();

    const deptsWithRooms = depts.filter((d) => (d.rooms ?? []).length > 0);
    const deptsNoRooms = depts.filter((d) => !d.rooms?.length);

    return (
      <div className="flex items-start gap-2 min-w-0 py-0.5 w-full" title={name}>
        <StaffAvatar avatarUrl={avatarUrl} name={name} />

        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-[#18181C] leading-tight truncate">{name}</p>

          <p className="text-[11px] text-[#71717A] whitespace-nowrap leading-4.5">
            {role && STAFF_POSITION?.[role]}
            {role && code && (
              <span className="mx-1 text-[#D4D4D8]" aria-hidden>
                ·
              </span>
            )}
            {code}
          </p>

          {/* Departments không có phòng */}
          {deptsNoRooms.length > 0 && (
            <div className="mt-0.5 space-y-0.5">
              {deptsNoRooms.map((dept) => (
                <p key={dept.id} className="text-[11px] text-[#A1A1AA] truncate" title={dept.name}>
                  {dept.name}
                </p>
              ))}
            </div>
          )}

          {/* Departments có phòng — accordion */}
          {deptsWithRooms.length > 0 && (
            <Accordion
              isCompact
              selectionMode="multiple"
              className="mt-0.5 px-0"
              itemClasses={{
                base: 'py-0 w-full',
                title: 'text-[11px] font-medium text-[#52525B] leading-[18px]',
                trigger:
                  'py-0 px-0 gap-0.5 h-[18px] hover:bg-transparent data-[hover=true]:bg-transparent',
                indicator: 'text-[#A1A1AA] w-3 h-3',
                content: 'pt-0.5 pb-1 pl-3',
              }}
            >
              {deptsWithRooms.map((dept) => (
                <AccordionItem
                  key={dept.id}
                  title={
                    <span className="flex items-center gap-1 min-w-0">
                      <span className="truncate max-w-30" title={dept.name}>
                        {dept.name}
                      </span>
                      <span className="shrink-0 text-[10px] text-[#A1A1AA]">
                        {dept.rooms?.length} phòng
                      </span>
                    </span>
                  }
                >
                  <ul className="space-y-0.5 border-l border-[#E4E4E7] pl-2">
                    {dept.rooms?.map((room) => (
                      <li
                        key={room.id}
                        className="flex items-center gap-1 text-[10px] text-[#71717A] leading-4"
                      >
                        <span className="h-px w-2 shrink-0 bg-[#D4D4D8]" aria-hidden />
                        <span className="truncate" title={room.name}>
                          {room.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    );
  },
);

StaffInfo.displayName = 'StaffInfo';
