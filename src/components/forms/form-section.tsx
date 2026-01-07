import React from "react";
import { Accordion, Box, Group, Stack, Text } from "@mantine/core";

import { Icons } from "../icons";

type Props = React.PropsWithChildren<{
  label: string | React.ReactNode;
  actions?: React.ReactNode;
  withToggle?: boolean;
  value?: string;
  defaultValue?: string | string[];
  height?: string | number
}>;

export const FormSection = ({ label, children, actions, withToggle, value, defaultValue, height }: Props) => {
  if (withToggle) {
    const accordionValue = value || "general";
    return (
      <Accordion
        defaultValue={defaultValue !== undefined ? defaultValue : accordionValue}
        variant="unstyled"
        chevronPosition="left"
        chevron={<Box component={Icons.down} w={20} />}
      >
        <Accordion.Item value={accordionValue}>
          <Accordion.Control>
            <Group>
              <Text fz="lg" fw={600} c="secondary">
                {label}
              </Text>

              {actions}
            </Group>
          </Accordion.Control>

          <Accordion.Panel>{children}</Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    );
  }

  return (
    <Stack gap="xs" h={height}>
      <Group>
        <Text fz="xl" fw={600}>
          {label}
        </Text>

        {actions}
      </Group>

      {children}
    </Stack>
  );
};
