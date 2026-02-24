import { memo, type FC } from 'react';
import { Avatar } from '@heroui/react';

interface StaffAvatarProps {
  avatarUrl?: string | null;
  name?: string;
}

export const StaffAvatar: FC<Readonly<StaffAvatarProps>> = memo(({ avatarUrl, name }) => {
  if (!avatarUrl) return <Avatar size="md" name={name} />;

  return <Avatar size="md" src={avatarUrl} />;
});

StaffAvatar.displayName = 'ShiftAvatar';
