// CommonTabs.tsx
import { Tabs, type TabsProps } from "@mantine/core";
import { useRouter } from "@tanstack/react-router";
import  type { ReactNode } from "react";

export type TabItem<T extends string> = {
  value: T;
  label: string | ReactNode;
  component: ReactNode;
};

type CommonTabsProps<T extends string> = {
  tabs: TabItem<T>[];
  activeTab?: T;
  onChange?: (value: T) => void;
  searchKey?: string;
  tabsProps?: Omit<TabsProps, "value" | "onChange">;
  classNames?: TabsProps["classNames"];
};

export function CommonTabs<T extends string>({
  tabs,
  activeTab: controlledValue,
  onChange,
  searchKey = "tab",
  tabsProps,
  classNames,
}: CommonTabsProps<T>) {
  // Nếu không có controlled value → lấy từ URL (TanStack Router)
//   const urlValue = useSearch({
//     select: (search: Record<string, string>) =>
//       (search[searchKey] as T) || tabs[0]?.value,
//   });

  const router = useRouter();

  const handleChange = (value: string | null) => {
    const val = value as T;

    if (onChange) {
      onChange(val);
    } 
    // else {
    //   router.history.push({
    //     search: (prev) => ({
    //       ...prev,
    //       [searchKey]: val || undefined,
    //     }),
    //   });
    // }
  };

  const activeValue = controlledValue ?? tabs[0]?.value;

  return (
    <Tabs
      value={activeValue}
      onChange={handleChange}
      keepMounted={false} // tối ưu performance nếu tab nặng
      {...tabsProps}
      classNames={classNames}
    >
      <Tabs.List>
        {tabs.map((item) => (
          <Tabs.Tab key={item.value} value={item.value}>
            {item.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {tabs.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value}>
          {tab.component}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}