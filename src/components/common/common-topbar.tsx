import type React from 'react';
import { Group, Paper, type PaperProps } from '@mantine/core';

type CommonTopbarProps = PaperProps & {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
};

export const CommonTopbar = ({ leading, trailing, ...props }: CommonTopbarProps) => {
  return (
    <Paper {...props}>
      <Group justify="space-between">
        <Group gap="xs">{leading}</Group>

        <Group gap="xs">{trailing}</Group>
      </Group>
    </Paper>
  );
};
