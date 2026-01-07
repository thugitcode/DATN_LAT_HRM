import { Group, Text } from "@mantine/core";

export type FilterItemProps = React.PropsWithChildren<{
  label?: string;
}>;

export const FilterItem = ({ children, label }: FilterItemProps) => {
  return (
    <Group gap={8}>
      {label && (
        <Text fz="sm" fw={500} c="#333">
          {label}
        </Text>
      )}

      {children}
    </Group>
  );
};
