import { Box, Loader, LoadingOverlay, Stack, Text, type BoxProps } from "@mantine/core";

type Props = BoxProps & {
  title?: string;
};

export const CommonInitializingComponent = ({ title, ...props }: Props) => {
  return (
    <Box h="100%" pos="relative" {...props}>
      <LoadingOverlay
        visible
        loaderProps={{
          children: (
            <Stack align="center">
              <Loader />
              <Text>{title ?? "Đang tải dữ liệu..."}</Text>
            </Stack>
          ),
        }}
      />
    </Box>
  );
};
