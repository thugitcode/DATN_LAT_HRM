import { Badge, type BadgeProps, type PolymorphicComponentProps } from "@mantine/core";

export type CommonBadgeProps = PolymorphicComponentProps<"div", BadgeProps>;

export const CommonBadge = (props: CommonBadgeProps) => {
  return <Badge variant="light" tt="unset" fw="normal" size="lg" {...props} />;
};
