import { Tabs, type ComboboxItem, type TabsListProps, type TabsProps } from "@mantine/core";

import { cn } from "@/lib/utils";

import styles from "./filters.module.css";

export type FilterTabBarProps = TabsProps & {
  data: ComboboxItem[];
  tabsListProps?: Omit<TabsListProps, "children">;
};

export const FilterTabBar = ({ data, className, tabsListProps, ...props }: FilterTabBarProps) => {
  return (
    <Tabs className={cn(styles.filterTabBar, className)} radius="md" {...props}>
      <Tabs.List mb="sm" {...tabsListProps}>
        {data.map((item) => (
          <Tabs.Tab key={item.value} value={item.value} fw={500}>
            {item.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
};
