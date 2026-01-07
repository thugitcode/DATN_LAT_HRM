import { Box, Button } from "@mantine/core";

import { Icons } from "./icons";

type Props = {
  label?: string;
  onClick?: () => void;
  count?: number;
};

export const ButtonFilter = ({ onClick, label, count }: Props) => {
  return (
    <Button
      variant="white"
      onClick={onClick}
      leftSection={<Box component={Icons.filter} w={20} />}
      c="#333"
      miw="fit-content"
    >
      {label ?? "Lọc"} {count ? `(${count})` : ""}
    </Button>
  );
};
