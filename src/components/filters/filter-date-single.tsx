import { Box } from "@mantine/core";
import { DatePickerInput, type DateInputSharedProps, type PickerBaseProps } from "@mantine/dates";

import { Icons } from "../icons";
import { FilterItem, type FilterItemProps } from "./filter-item";

type Props = Pick<FilterItemProps, "label"> &
  Pick<PickerBaseProps<"default">, "value" | "onChange"> &
  Pick<DateInputSharedProps, "placeholder"> & {
    clearable?: boolean;
  };


export const FilterDateSingle = ({
  label,
  value,
  onChange,
  placeholder,
  clearable = true,
}: Props) => {
  return (
    <FilterItem label={label}>
      <DatePickerInput
        valueFormat="DD/MM/YYYY"
        placeholder={placeholder ?? "Chọn ngày"}
        clearable={clearable}
        miw={200}
        value={value}
        onChange={onChange}
        leftSection={<Box component={Icons.calendar} w={18} mt={-2} />}
      />
    </FilterItem>
  );
};