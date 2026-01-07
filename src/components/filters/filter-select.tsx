import { Select, type SelectProps } from "@mantine/core";

import { FilterItem, type FilterItemProps } from "./filter-item";

type Props = Pick<FilterItemProps, "label"> &
  Pick<SelectProps, "value" | "data" | "onChange" | "placeholder" | "clearable">;

export const FilterSelect = ({ label, value, data, onChange, placeholder, clearable }: Props) => {
  return (
    <FilterItem label={label}>
      <Select
        placeholder={placeholder ?? "Chọn"}
        value={value}
        onChange={onChange}
        data={data}
        clearable={clearable}
        allowDeselect={false}
      />
    </FilterItem>
  );
};
