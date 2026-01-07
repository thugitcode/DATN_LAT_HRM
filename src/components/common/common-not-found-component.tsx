import { useNavigate } from "@tanstack/react-router";
import { Button, Stack, Text, Title, type StackProps } from "@mantine/core";

type Props = StackProps & {
  variant?: "data" | "page";
};

export const CommonNotFoundComponent = ({ variant = "data", ...props }: Props) => {
  const navigate = useNavigate();

  let content = null;
  let action = null;

  switch (variant) {
    case "page":
      content = "Không tìm thấy trang";
      action = <Button onClick={() => navigate({ to: "/" })}>Quay về trang chủ</Button>;
      break;

    default:
      content = "Không tìm thấy dữ liệu";
      break;
  }

  return (
    <Stack justify="center" align="center" h="100%" {...props}>
      <Title order={1} ta="center">
        404
      </Title>

      <Text ta="center">{content}</Text>

      {action}
    </Stack>
  );
};
