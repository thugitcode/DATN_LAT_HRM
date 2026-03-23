import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Tab,
  Tabs,
  useDisclosure,
} from '@heroui/react';
import { IconSparkles } from '@tabler/icons-react';

import { ActionsPage } from '@/components/actions-page';
import { TitlePage } from '@/components/title-page';

import { PageFilter } from '../components/page-filter';
import { useCurrentLayout } from '../hooks/use-current-layout';
import { TAB_CONTENT_MAP } from './components/tab-content-map';
import { getTabLegendMap } from './components/tab-legend-map';
import { TimekeepingManagementLegend } from './components/timekeeping-management-legend';
import { TimekeepingManagementPrint } from './components/timekeeping-management-print';
import { ApproveAttendanceButton } from './components/work-sheet-by-shift/approve-attendance-button';
import { useTimekeepingExport } from './hooks/use-timekeeping-export';
import { useTimekeepingPrint } from './hooks/use-timekeeping-print';
import { useTimekeepingTabData } from './hooks/use-timekeeping-tab-data';
import { useTimekeepingTabs } from './hooks/use-timekeeping-tabs';
import { useTimekeepingTranslation } from './hooks/use-timekeeping-translation';
import { TAB_KEYS } from './types/index.type';

export const TimekeepingManagement = () => {
  const { t } = useTimekeepingTranslation();
  const currentLayout = useCurrentLayout();
  const { tabs, activeKey, activeTab, onSelectionChange } = useTimekeepingTabs();
  const tabData = useTimekeepingTabData(activeKey);
  const tabLegendMap = getTabLegendMap(t);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const { onExport } = useTimekeepingExport(activeKey, tabData);
  const { onPrint, printState, printRef, year, month, departmentName } = useTimekeepingPrint(
    activeKey,
    tabData,
  );

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-3">
        <div className="space-y-3 px-6">
          <Tabs
            aria-label="Timekeeping tabs"
            variant="underlined"
            color="primary"
            selectedKey={activeKey}
            onSelectionChange={(key) => onSelectionChange(key as TAB_KEYS)}
          >
            {tabs.map((tab) => (
              <Tab key={tab.key} title={tab.label} />
            ))}
          </Tabs>

          <div className="flex items-center justify-between">
            <TitlePage title={activeTab.label} />
            <ActionsPage
              hiddenLayoutSwitcher={activeKey === TAB_KEYS.DETAILED_TIME_SHEET}
              onExport={onExport}
              onPrint={onPrint}
              actions={<ApproveAttendanceButton />}
            />
          </div>

          <PageFilter />
        </div>

        {TAB_CONTENT_MAP[activeKey]}
      </div>

      <TimekeepingManagementLegend
        showStatus={activeKey !== TAB_KEYS.HOURLY_PAYROLL}
        legendItems={tabLegendMap[activeKey]}
      />

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="center"
        backdrop="blur"
        size="md"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col items-center gap-2">
                <div className="bg-primary/10 text-primary p-3 rounded-full">
                  <IconSparkles size={28} />
                </div>
                <h2 className="text-xl font-bold text-center">
                  {t('timekeeping_management.coming_soon.title')}
                </h2>
              </ModalHeader>

              <ModalBody>
                <p className="text-center text-default-600">
                  Chúng tôi đang nỗ lực để hoàn thành tính năng này.
                  <br />
                  Vui lòng chờ bản cập nhật sắp tới!
                </p>
              </ModalBody>

              <ModalFooter className="flex justify-center">
                <Button
                  color="primary"
                  variant="flat"
                  className="px-6 font-semibold"
                  onPress={onClose}
                >
                  Đã hiểu
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <div className="hidden">
        <TimekeepingManagementPrint
          ref={printRef}
          tab={printState?.tab ?? activeKey}
          data={printState?.data ?? []}
          year={year}
          month={month}
          layout={currentLayout}
          departmentName={departmentName}
        />
      </div>
    </div>
  );
};
