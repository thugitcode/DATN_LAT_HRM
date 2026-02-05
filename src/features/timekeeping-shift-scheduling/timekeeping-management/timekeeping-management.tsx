import { Tab, Tabs } from '@heroui/react';

import { TimekeepingToolbar } from './components/timekeeping-toolbar/timekeeping-toolbar';
import { tabs } from './constants/data';

export const TimekeepingManagement = () => {
  return (
    <div className="space-y-3">
      <Tabs aria-label="Tabs variants" variant={'underlined'} color={'primary'}>
        {tabs.map((tab) => (
          <Tab key={tab.key} title={tab.label} />
        ))}
      </Tabs>

      <TimekeepingToolbar title="Bảng công theo ca" />
    </div>
  );
};
