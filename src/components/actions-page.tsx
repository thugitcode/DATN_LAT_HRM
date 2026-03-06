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
  isLoading?: boolean;
  isDisabled?: boolean;
  children: ReactNode;
}

const ActionButton: FC<ActionButtonProps> = ({
  tooltip,
  ariaLabel,
  onPress,
  isLoading,
  isDisabled,
  children,
}) => (
  <Tooltip content={tooltip} showArrow>
    <Button
      isIconOnly
      aria-label={ariaLabel}
      variant="faded"
      color="default"
      className={ACTION_BTN_CLASS}
      onPress={onPress}
      isLoading={isLoading}
      isDisabled={isDisabled}
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
  onPrint?: () => void;
  onImport?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const ActionsPage = <T extends Record<string, unknown> = Record<string, unknown>>({
  actions,
  hiddenLayoutSwitcher = false,
  importConfig,
  onExportTemplate,
  onExport,
  onPrint,
  onImport,
}: ActionsPageProps<T>) => {
  const { clearFilters } = useQueryFilter({ replace: true });

  return (
    <div className="flex items-stretch gap-3">
      <ul className="flex items-center gap-2">
        <li>
          <ActionButton tooltip="Tải lại" ariaLabel="Reload" onPress={clearFilters}>
            {icons.reload}
          </ActionButton>
        </li>

        {/* Chỉ render khi có importConfig */}
        {onImport && (
          <li>
            <ActionButton tooltip="Nhập file excel" ariaLabel="Import excel" onPress={onImport}>
              {icons.import}
            </ActionButton>
          </li>
        )}

        {onExport && (
          <li>
            <ActionButton tooltip="Xuất excel" ariaLabel="export excel" onPress={onExport}>
              {icons.export}
            </ActionButton>
          </li>
        )}

        {onExportTemplate && (
          <li>
            <ActionButton
              tooltip="Xuất file mẫu"
              ariaLabel="Export excel template"
              onPress={onExportTemplate}
            >
              {icons.exportSampleFile}
            </ActionButton>
          </li>
        )}

        {onPrint && (
          <li>
            <ActionButton tooltip="In" ariaLabel="In" onPress={onPrint}>
              {icons.print}
            </ActionButton>
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
