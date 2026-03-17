import type { FC, ReactNode } from 'react';
import { Button, Tooltip } from '@heroui/react';

import { cn } from '@/lib/utils';

interface ActionButtonProps {
  tooltip: string;
  ariaLabel: string;
  onPress: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
  className?: string;
}

const ACTION_BTN_CLASS = 'border-none bg-[#D4D4D866] rounded-lg';

export const ActionButton: FC<ActionButtonProps> = ({
  tooltip,
  ariaLabel,
  onPress,
  isLoading,
  isDisabled,
  children,
  className,
}) => (
  <Tooltip content={tooltip} showArrow>
    <Button
      isIconOnly
      aria-label={ariaLabel}
      variant="faded"
      color="default"
      className={cn(ACTION_BTN_CLASS, className)}
      onPress={onPress}
      isLoading={isLoading}
      isDisabled={isDisabled}
    >
      {children}
    </Button>
  </Tooltip>
);
