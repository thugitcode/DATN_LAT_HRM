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
import { TAB_CONTENT_MAP } from './components/tab-content-map';
import { TAB_LEGEND_MAP } from './components/tab-legend-map';
import { TimekeepingManagementLegend } from './components/timekeeping-management-legend';
import { useTimekeepingTabs } from './hooks/use-timekeeping-tabs';
import { TAB_KEYS } from './types/index.type';

export const TimekeepingManagement = () => {
  const { tabs, activeKey, activeTab, setActiveKey } = useTimekeepingTabs();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <div className="flex flex-col justify-between h-full">
      <div className="space-y-3">
        <div className="space-y-3 px-6">
          <Tabs
            aria-label="Timekeeping tabs"
            variant="underlined"
            color="primary"
            selectedKey={activeKey}
            onSelectionChange={(key) => setActiveKey(key as TAB_KEYS)}
          >
            {tabs.map((tab) => (
              <Tab key={tab.key} title={tab.label} />
            ))}
          </Tabs>

          <div className="flex items-center justify-between">
            <TitlePage title={activeTab.label} />
            <ActionsPage
              hiddenLayoutSwitcher={activeKey === TAB_KEYS.DETAILED_TIME_SHEET}
              actions={
                <div className="flex gap-3">
                  <Button color="primary" onPress={onOpen}>
                    Duyệt bảng công
                  </Button>
                </div>
              }
            />
          </div>

          <PageFilter />
        </div>

        {TAB_CONTENT_MAP[activeKey]}
      </div>

      <TimekeepingManagementLegend
        showStatus={activeKey !== TAB_KEYS.HOURLY_PAYROLL}
        legendItems={TAB_LEGEND_MAP[activeKey]}
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
                <h2 className="text-xl font-bold text-center">Coming Soon </h2>
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
    </div>
  );
};
