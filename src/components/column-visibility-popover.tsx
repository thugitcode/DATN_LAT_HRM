/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from '@heroui/react';

import { icons } from '@/lib/icons';
import type { ColumnDef } from '@/components/data-table/data-table';

interface ColumnVisibilityPopoverProps<T extends object> {
  columns: ColumnDef<T>[];
  visibleColumns: Set<string>;
  onApply: (visibleKeys: Set<string>, saveAsDefault: boolean) => void;
}

export function ColumnVisibilityPopover<T extends object>({
  columns,
  visibleColumns,
  onApply,
}: ColumnVisibilityPopoverProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState<Set<string>>(visibleColumns);
  const [saveAsDefault, setSaveAsDefault] = useState(false);
  const [draftBeforeDefault, setDraftBeforeDefault] = useState<Set<string> | null>(null);

  const allKeys = new Set(
    columns.filter((col) => col.hideable !== false && col.title !== '').map((col) => col.key),
  );
  const hideableColumns = columns.filter((col) => col.hideable !== false && col.title !== '');

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraft(new Set(visibleColumns));
      setSaveAsDefault(false);
      setDraftBeforeDefault(null);
    }
    setIsOpen(open);
  };

  const handleToggle = (key: string) => {
    setDraft((prev) => {
      if (prev.has(key) && prev.size === 1) return prev;
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleToggleDefault = (checked: boolean) => {
    setSaveAsDefault(checked);
    if (checked) {
      setDraftBeforeDefault(new Set(draft));
      setDraft(new Set(allKeys));
    } else {
      setDraft(draftBeforeDefault ?? new Set(visibleColumns));
      setDraftBeforeDefault(null);
    }
  };

  const handleApply = () => {
    onApply(draft, saveAsDefault);
    setIsOpen(false);
  };

  return (
    <Popover placement="bottom-end" isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Tooltip content="Tuỳ chỉnh cột" showArrow>
        <div>
          <PopoverTrigger>
            <Button
              isIconOnly
              aria-label="Toggle columns"
              variant="faded"
              color="default"
              className="border-none bg-[#D4D4D866] rounded-lg"
            >
              {icons.menu}
            </Button>
          </PopoverTrigger>
        </div>
      </Tooltip>

      <PopoverContent className="px-6 pt-6 min-w-115 rounded-[14px] shadow-lg items-start">
        <p className="text-2xl font-medium text-[#11181C]">Tuỳ chỉnh cột</p>

        <div className="mt-3 grid grid-cols-2 max-h-72 overflow-y-auto">
          {hideableColumns.map((col) => (
            <label
              key={col.key}
              className="flex items-center gap-2 py-2 px-1 rounded-md hover:bg-[#F4F4F5] cursor-pointer select-none"
            >
              <Checkbox
                size="sm"
                isSelected={draft.has(col.key)}
                onValueChange={() => handleToggle(col.key)}
              />
              <span className="text-base text-[#11181C]">{col.title}</span>
            </label>
          ))}
        </div>

        <Divider />

        <div className="flex items-center justify-between py-3 w-full">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <Checkbox size="sm" isSelected={saveAsDefault} onValueChange={handleToggleDefault} />
            <span className="text-base text-[#11181C]">Cấu hình hiển thị mặc định</span>
          </label>

          <div className="flex items-center gap-2">
            <Button
              variant="bordered"
              className="rounded-lg border-[#E4E4E7] text-[#3F3F46] min-w-16"
              onPress={() => setIsOpen(false)}
            >
              Huỷ
            </Button>
            <Button color="primary" className="rounded-lg min-w-20" onPress={handleApply}>
              Cập nhật
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
