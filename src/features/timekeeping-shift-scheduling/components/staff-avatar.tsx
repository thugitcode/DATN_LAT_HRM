import { memo, type FC } from 'react';
import { Avatar } from '@heroui/react';
import GetSignedUrl from '@/components/get-signed-url';

interface StaffAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  className?: string;
}

export const StaffAvatar: FC<Readonly<StaffAvatarProps>> = memo(({ avatarUrl, name, className }) => {
  if (!avatarUrl) return <Avatar size="md" name={name} className={className} />;

  return <GetSignedUrl url={avatarUrl || ''}>
    {(signedUrl) => {
      return <Avatar
        src={signedUrl || `https://ui-avatars.com/api/?name=${name || 'Staff'}&background=random`}
        size='md'
        className={className}
      />
    }}
  </GetSignedUrl>;
});

StaffAvatar.displayName = 'ShiftAvatar';
