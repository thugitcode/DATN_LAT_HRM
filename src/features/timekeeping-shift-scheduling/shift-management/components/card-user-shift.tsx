import { memo, type FC } from 'react';

import { formatWorkDate } from '../../helper';
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
}

export const CardUserShift: FC<Readonly<CardUserShiftProps>> = memo(
  ({ avatarUrl, name, code, startTime, endTime, shiftTemplateName, workDate, departmentName }) => {
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
