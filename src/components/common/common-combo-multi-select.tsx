import {
  Box,
  CheckIcon,
  Combobox,
  Flex,
  Group,
  InputLabel,
  Loader,
  Pill,
  PillsInput,
  Stack,
  Tooltip,
  useCombobox,
  type MantineSize,
} from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RADIUS_INPUT } from '@/lib/constants';

type Option = { label: string; value: string };

type Props = {
  data: Option[];
  selectedList?: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  onFocus?: () => Promise<void>;
  label?: string;
  placeholder?: string;
  searchable?: boolean;
  loading?: boolean;
  maxDisplayedValues?: number;
  size?: MantineSize;
  radius?: number | string;
  bg?: string;
  onBlur?: () => void;
  showOuterPill?: boolean;
};

export function CommonMultiSelect({
  data,
  selectedList,
  value,
  onChange,
  onFocus,
  placeholder = 'Select values',
  searchable = true,
  maxDisplayedValues = 0,
  label,
  size = 'md',
  radius = RADIUS_INPUT,
  bg,
  loading,
  onBlur,
  showOuterPill,
}: Props) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
    onDropdownOpen: () => combobox.updateSelectedOptionIndex('active'),
  });

  const hasFetchedRef = useRef(false);
  const [search, setSearch] = useState('');

  /** 🔁 Derived computed values */
  const filteredOptions = useMemo(
    () =>
      data.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      ),
    [data, search],
  );

  const displayedPills = useMemo(() => {
    if (maxDisplayedValues <= 0) return [];
    const count = Math.max(maxDisplayedValues - 1, 1);
    return value.slice(0, count);
  }, [value, maxDisplayedValues]);

  const hiddenValues = useMemo(
    () => value.slice(displayedPills.length),
    [value, displayedPills],
  );

  /** 🧠 helpers */
  const removeValue = useCallback(
    (val: string) => onChange(value.filter((v) => v !== val)),
    [value, onChange],
  );

  const toggleValue = useCallback(
    (val: string) =>
      onChange(
        value.includes(val)
          ? value.filter((v) => v !== val)
          : [...value, val],
      ),
    [value, onChange],
  );

  const focusHandler = useCallback(async () => {
    if (onFocus && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      await onFocus();
    }
    combobox.openDropdown();
  }, [onFocus]);

  return (
    <Stack gap={8}>
      {label && (
        <InputLabel mb={2} size="sm">
          {label}
        </InputLabel>
      )}

      <Combobox
        store={combobox}
        onOptionSubmit={toggleValue}
        withinPortal={false}
      >
        <Combobox.DropdownTarget>
          <PillsInput size={size} radius={radius} styles={{ input: { background: bg } }}>
            <Pill.Group style={{ flexWrap: 'nowrap' }}>
              {/* Render pills */}
              {value.length > 0 && (
                <>
                  {displayedPills.map((val) => {
                    const opt = data.find((d) => d.value === val);
                    return (
                      <Pill
                        bg="#4263eb"
                        c="white"
                        radius={5}
                        key={val}
                        withRemoveButton
                        onRemove={() => removeValue(val)}
                      >
                        {opt?.label}
                      </Pill>
                    );
                  })}

                  {hiddenValues.length > 0 && (
                    <Tooltip
                      withArrow
                      zIndex={600}
                      label={
                        hiddenValues
                          .slice(0, 5)
                          .map(
                            (hv) =>
                              (data.length ? data : selectedList)?.find(
                                (d) => d.value === hv,
                              )?.label,
                          )
                          .filter(Boolean)
                          .join(', ') +
                        (hiddenValues.length > 5
                          ? ` +${hiddenValues.length - 5}...`
                          : '')
                      }
                    >
                      <Box>
                        <Pill radius={5} bg="#4263eb" c="white">
                          +{hiddenValues.length}...
                        </Pill>
                      </Box>
                    </Tooltip>
                  )}
                </>
              )}

              {/* Search Field */}
              <Combobox.EventsTarget>
                <PillsInput.Field
                  value={search}
                  placeholder={value.length === 0 ? placeholder : undefined}
                  onChange={(e) => {
                    setSearch(e.currentTarget.value);
                    combobox.openDropdown();
                  }}
                  onFocus={focusHandler}
                  onBlur={() => {
                    onBlur?.();
                    combobox.closeDropdown();
                    setSearch('');
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Backspace' && search.length === 0) {
                      removeValue(value[value.length - 1] ?? '');
                    }
                  }}
                />
              </Combobox.EventsTarget>
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>

        <Combobox.Dropdown>
          {loading ? (
            <Flex justify="center" p={12}>
              <Loader size={16} />
            </Flex>
          ) : (
            <Combobox.Options>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((item) => (
                  <Combobox.Option
                    key={item.value}
                    value={item.value}
                    active={value.includes(item.value)}
                  >
                    <Group gap="sm">
                      {value.includes(item.value) && <CheckIcon size={12} />}
                      <span>{item.label}</span>
                    </Group>
                  </Combobox.Option>
                ))
              ) : (
                <Combobox.Empty>Nothing found</Combobox.Empty>
              )}
            </Combobox.Options>
          )}
        </Combobox.Dropdown>
      </Combobox>

      {showOuterPill && (
        <Flex gap={8} wrap="wrap">
          {value.map((it) => {
            const label =
              data.find((d) => d.value === it)?.label ??
              selectedList?.find((d) => d.value === it)?.label;

            return (
              <Pill
                bg="white"
                key={it}
                withRemoveButton
                radius={6}
                h={34}
                c="var(--mantine-color-text)"
                onRemove={() => removeValue(it)}
                size="md"
                styles={{ label: { textAlign: 'center', display: 'flex', alignItems: 'center' } }}
              >
                {label}
              </Pill>
            );
          })}
        </Flex>
      )}
    </Stack>
  );
}
