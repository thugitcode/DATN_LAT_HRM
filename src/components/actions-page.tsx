import type { FC, ReactNode } from 'react';
import { Button, Tooltip } from '@heroui/react';

import { icons } from '@/lib/icons';
import { useExcelIO } from '@/hooks/use-excel-io';
import type { ExcelExportConfig, ExcelImportConfig } from '@/hooks/use-excel-io';
import { useQueryFilter } from '@/hooks/useQueryFilter';

import { LayoutSwitcher } from './layout-switcher';

// ─── Constants ───────────────────────────────────────────────────────────────

const DIVIDER_CLASS = 'inline-block w-0.5 bg-[#11111126] self-stretch';
const ACTION_BTN_CLASS = 'border-none bg-[#D4D4D866] rounded-lg';

// ─── Sub-components ──────────────────────────────────────────────────────────

interface ActionButtonProps {
  tooltip: string;
  ariaLabel: string;
  onPress: () => void;
  children: ReactNode;
}

const ActionButton: FC<ActionButtonProps> = ({ tooltip, ariaLabel, onPress, children }) => (
  <Tooltip content={tooltip} showArrow>
    <Button
      isIconOnly
      aria-label={ariaLabel}
      variant="faded"
      color="default"
      className={ACTION_BTN_CLASS}
      onPress={onPress}
    >
      {children}
    </Button>
  </Tooltip>
);

const Divider: FC = () => <span className={DIVIDER_CLASS} />;

// ─── Types ───────────────────────────────────────────────────────────────────

interface ActionsPageProps<T extends Record<string, unknown> = Record<string, unknown>> {
  actions?: ReactNode;
  hiddenLayoutSwitcher?: boolean;
  exportConfig?: ExcelExportConfig<T>;
  importConfig?: ExcelImportConfig<T>;
  onExportTemplate?: () => void;
  onExport?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ActionsPage = <T extends Record<string, unknown> = Record<string, unknown>>({
  actions,
  hiddenLayoutSwitcher = false,
  importConfig,
  onExportTemplate,
  onExport,
}: ActionsPageProps<T>) => {
  const { clearFilters } = useQueryFilter({ replace: true });
  const { fileInputRef, triggerImport, handleFileChange } = useExcelIO();

  return (
    <div className="flex items-stretch gap-3">
      <ul className="flex items-center gap-2">
        <li>
          <ActionButton tooltip="Tải lại" ariaLabel="Reload" onPress={clearFilters}>
            {icons.reload}
          </ActionButton>
        </li>

        {importConfig && (
          <li>
            <ActionButton
              tooltip="Nhập file excel"
              ariaLabel="Import excel"
              onPress={triggerImport}
            >
              I
            </ActionButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileChange(e, importConfig)}
            />
          </li>
        )}
      </ul>

      <Divider />

      {!hiddenLayoutSwitcher && (
        <>
          <LayoutSwitcher />
          <Divider />
        </>
      )}

      {actions}
    </div>
  );
};
