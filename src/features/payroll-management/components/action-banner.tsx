import { Button } from '@heroui/react';
import type { SummaryFinalize } from '../types/summary-finalize.type';
import { cn } from '@/lib/utils';

type TFunc = (key: string, fallback: string) => string;

interface ActionBannerProps {
  t: TFunc;
  onSaveDraft: () => void;
  onTransfer: () => void;
  isTransferring: boolean;
  data: SummaryFinalize | undefined;
}

export const ActionBanner = ({ t, onSaveDraft, onTransfer, isTransferring, data }: ActionBannerProps) => {
  return (
    <div className="flex flex-col items-start justify-between gap-4 rounded-xl  bg-[#E6F1FE] px-5 py-4 sm:flex-row sm:items-center">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#006FEE] text-xs font-bold text-white"
        >
          i
        </span>
        <div className="text-sm text-[#006FEE]">
          <p className="font-medium">
            {t('summary-finalize.banner.ready', 'Sẵn sàng chuyển sang Tính lương')}
          </p>
          <p className="mt-0.5 text-[#006FEE]">
            {t(
              'summary-finalize.banner.warning',
              'Sau khi chốt, dữ liệu đầu vào sẽ bị khoá. Mọi thay đổi cần huỷ chốt trước khi chỉnh sửa.',
            )}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 gap-3">
        {/* <Button variant="bordered" color="primary" onPress={onSaveDraft}>
        {t('summary-finalize.actions.save-draft', 'Lưu nháp')}
      </Button> */}

        <Button color="primary" disabled={!data} className={cn(!data ? "opacity-50 cursor-not-allowed" : "")} isLoading={isTransferring} onPress={onTransfer}>
          {t('summary-finalize.actions.transfer', 'Chuyển tính lương')}
        </Button>
      </div>
    </div>
  )
};
