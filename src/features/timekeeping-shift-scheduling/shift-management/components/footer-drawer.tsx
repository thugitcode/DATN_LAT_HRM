import type { FC } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';
import { useTranslation } from 'react-i18next';

interface FooterFrawerProps {
  isLoading?: boolean;
  submitLabel?: string;
}

export const FooterFrawer: FC<FooterFrawerProps> = ({ isLoading, submitLabel = 'Lưu' }) => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const closedDrawer = useDrawer((state) => state.onClose);

  return (
    <div className="flex justify-end gap-2 pt-3 pb-6 px-6 bg-white w-full">
      <Button
        variant="light"
        onPress={closedDrawer}
        className="border-[#006FEE] border bg-white text-[#006FEE] text-[14px] font-normal"
      >
        {t('button.cancel')}
      </Button>
      <Button type="submit" color="primary" isLoading={isLoading}>
        {submitLabel}
      </Button>
    </div>
  );
};
