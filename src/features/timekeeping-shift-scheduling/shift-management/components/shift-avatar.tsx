import { memo, type FC } from 'react';
import { Avatar } from '@heroui/react';

interface ShiftAvatarProps {
  avatarUrl?: string | null;
  name?: string;
}

export const ShiftAvatar: FC<Readonly<ShiftAvatarProps>> = memo(({ avatarUrl, name }) => {
  if (!avatarUrl) return <Avatar size="md" name={name} />;

  return <Avatar size="md" src={avatarUrl} />;
});

ShiftAvatar.displayName = 'ShiftAvatar';
