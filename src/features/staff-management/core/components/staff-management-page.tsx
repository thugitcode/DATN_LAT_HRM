import { type FC, type ReactNode } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { Button, Chip } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { LayoutSwitcherEnum } from '@/types/global.type';
import { cn } from '@/lib/utils';
import { ActionsPage } from '@/components/actions-page';
import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';
import { useCurrentLayout } from '@/features/timekeeping-shift-scheduling/hooks/use-current-layout';

import { StaffManagementFilters } from './staff-management-fitlers';

export interface StaffManagementPageProps {
  title: string;
  onExport: () => void;
  onPrint: () => void;
  printContent: ReactNode;
  listLayout: ReactNode;
  gribLayout: ReactNode;

  workingCount: number;
  resignedCount: number;
}

export const StaffManagementPage: FC<StaffManagementPageProps> = ({
  onExport,
  onPrint,
  printContent,
  title,
  listLayout,
  gribLayout,
  resignedCount,
  workingCount,
}) => {
  const currentLayout = useCurrentLayout();
  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);

  const open = useDrawer((state) => state.onOpen);

  return (
    <PageContainer className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <TitlePage title={title} />
          <div className="flex items-center gap-2">
            <Chip
              size="md"
              variant="bordered"
              classNames={{ content: '!leading-5 text-sm', base: 'py-1 px-2' }}
              startContent={
                <span className="w-1.5 h-1.5 rounded-full p-1 bg-[#17C964] mr-1"></span>
              }
            >
              {t('options.staff_status.WORKING')}: {workingCount}
            </Chip>
            <Chip
              size="md"
              variant="bordered"
              classNames={{ content: '!leading-5 text-sm', base: 'py-1 px-2' }}
              startContent={<span className="w-1.5 h-1.5 rounded-full bg-[#71717A] mr-1"></span>}
            >
              {t('off')}: {resignedCount}
            </Chip>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ActionsPage
            onPrint={onPrint}
            onExport={onExport}
            // onImport={() => fileInputRef.current?.click()}
            actions={
              <div className="flex gap-3">
                <Button color="primary" onPress={() => open(DrawerType.CREATE_KPI)}>
                  {t('button.add_staff')}
                </Button>
              </div>
            }
          />
        </div>
      </div>

      <StaffManagementFilters />

      <div className={cn(currentLayout === LayoutSwitcherEnum.LIST && '')}>
        {currentLayout === LayoutSwitcherEnum.LIST ? listLayout : gribLayout}
      </div>

      <div className="hidden">{printContent}</div>
    </PageContainer>
  );
};
