import { Avatar } from '@heroui/react';

import type { Status } from '@/types/global.type';
import type { Staff } from '@/types/staff.type';
import GetSignedUrl from '@/components/get-signed-url';

interface StaffNameCellProps {
  record: Staff;
  jobTitle: string;
  status?: Status;
}

const getAvatarSrc = (signedUrl: string | null, name: string): string => {
  return (
    signedUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Staff')}&background=random`
  );
};

export const StaffNameCell = ({ record, jobTitle, status }: StaffNameCellProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
        <GetSignedUrl url={record.avatar ?? ''}>
          {(signedUrl) => (
            <Avatar
              src={getAvatarSrc(signedUrl, record.name)}
              className="w-full h-full object-cover"
            />
          )}
        </GetSignedUrl>
      </div>
      <div>
        <p className="text-sm text-[#11181C]">{record.name}</p>
        <p className="text-xs text-[#A1A1AA] mt-0.5">
          {jobTitle} - {record.code}
        </p>
      </div>

      <div className="flex-1 flex items-center justify-end">{status}</div>
    </div>
  );
};
