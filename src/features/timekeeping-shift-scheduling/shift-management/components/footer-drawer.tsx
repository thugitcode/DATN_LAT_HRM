import type { FC } from 'react';
import { useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';

interface FooterFrawerProps {
  isLoading?: boolean;
}

export const FooterFrawer: FC<FooterFrawerProps> = ({ isLoading }) => {
  const closedDrawer = useDrawer((state) => state.onClose);

  return (
    <div className="flex justify-end gap-2 pt-3 pb-6 px-6 bg-white w-full">
      <Button
        variant="light"
        onPress={closedDrawer}
        className="border-[#006FEE] border bg-white text-[#006FEE] text-[14px] font-normal"
      >
        Hủy
      </Button>
      <Button type="submit" color="primary" isLoading={isLoading}>
        Lưu
      </Button>
    </div>
  );
};
