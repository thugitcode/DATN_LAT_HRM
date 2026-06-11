import { useState } from 'react';
import { Tabs, Tab } from '@heroui/react';
import SalaryComponentsTab from './salary/SalaryComponentsTab';
import PayrollTemplateTab from './salary/PayrollTemplateTab';

const SalaryCategory = () => {
  const [activeSubTab, setActiveSubTab] = useState(() => {
    return localStorage.getItem('active_salary_sub_tab') || 'components';
  });

  const handleTabChange = (key: string) => {
    setActiveSubTab(key);
    localStorage.setItem('active_salary_sub_tab', key);
  };

  return (
    <div className="flex flex-col h-full bg-white p-2 rounded-xl">
      <Tabs 
        selectedKey={activeSubTab} 
        onSelectionChange={(key) => handleTabChange(key as string)} // <-- Đổi từ setActiveSubTab sang hàm handleTabChange mới
        color="primary" variant="underlined"
        classNames={{
          tabList: "gap-6 w-full border-b border-divider bg-white px-4 mb-4",
          cursor: "w-full bg-blue-800",
          tab: "max-w-fit h-12 text-sm font-medium",
          tabContent: "font-semibold text-gray-500"
        }}
      >
        <Tab key="components" title="Danh mục thành phần lương">
          <SalaryComponentsTab />
        </Tab>
        <Tab key="template" title="Mẫu bảng lương">
          <PayrollTemplateTab />
        </Tab>
        <Tab key="scale" title="Thang bảng lương"></Tab>
        <Tab key="allowance" title="Chính sách phụ cấp và khấu trừ"></Tab>
        <Tab key="tax" title="Thuế TNCN"></Tab>
      </Tabs>
    </div>
  );
};

export default SalaryCategory;