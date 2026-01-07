import { Box } from "@mantine/core";
import { DatePickerInput, type DateInputSharedProps, type PickerBaseProps } from "@mantine/dates";

import { Icons } from "../icons";
import { FilterItem, type FilterItemProps } from "./filter-item";

type Props = Pick<FilterItemProps, "label"> &
  Pick<PickerBaseProps<"range">, "value" | "onChange"> &
  Pick<DateInputSharedProps, "placeholder">;

export const FilterDateRange = ({ label, value, onChange, placeholder }: Props) => {
  return (
    <FilterItem label={label}>
      <DatePickerInput
        type="range"
        valueFormat="DD/MM/YYYY"
        clearable
        placeholder={placeholder ?? "Từ ngày - Đến ngày"}
        miw={250}
        value={value}
        onChange={onChange}
        leftSection={<Box component={Icons.calendar} w={18} mt={-2} />}
      />
    </FilterItem>
  );
};
