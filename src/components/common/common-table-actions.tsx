import { Group, type GroupProps } from "@mantine/core";

export type CommonTableActionsProps = GroupProps;

export const CommonTableActions = ({ onClick, ...props }: CommonTableActionsProps) => {
  return (
    <Group
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      gap={4}
      {...props}
    />
  );
};
