import type { FC, ReactNode } from 'react';
import { Button, Tooltip } from '@heroui/react';

import { icons } from '@/lib/icons';
import { useQueryFilter } from '@/hooks/useQueryFilter';

import { LayoutSwitcher } from './layout-switcher';

interface ActionsPageProps {
  actions?: ReactNode;
  hiddenLayoutSwitcher?: boolean;
  // exportConfig?: ExcelExportConfig;
  // importConfig?: ExcelImportConfig;
}

export const ActionsPage: FC<Readonly<ActionsPageProps>> = ({
  actions,
  hiddenLayoutSwitcher = false,
  // exportConfig,
  // importConfig,
}) => {
  const { clearFilters } = useQueryFilter({ replace: true });

  // const { fileInputRef, exportTemplate, triggerImport, handleFileChange } = useExcelIO();

  return (
    <div className="flex items-stretch gap-3">
      <ul className="flex items-center gap-2">
        {/* Reload */}
        <li>
          <Tooltip content="Tải lại" showArrow>
            <Button
              isIconOnly
              aria-label="Reload"
              variant="faded"
              color="default"
              className="border-none bg-[#D4D4D866] rounded-lg"
              onPress={clearFilters}
            >
              {icons.reload}
            </Button>
          </Tooltip>
        </li>

        <li>
          <Tooltip content="Nhập file excel" showArrow>
            <Button
              isIconOnly
              aria-label="Import excel"
              variant="faded"
              color="default"
              className="border-none bg-[#D4D4D866] rounded-lg"
              // isDisabled={!importConfig}
              // onPress={importConfig ? triggerImport : undefined}
            >
              I
            </Button>
          </Tooltip>

          {/* {importConfig && (
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileChange(e, importConfig)}
            />
          )} */}
        </li>

        <li>
          <Tooltip content="Xuất file mẫu" showArrow>
            <Button
              isIconOnly
              aria-label="Export template"
              variant="faded"
              color="default"
              className="border-none bg-[#D4D4D866] rounded-lg"
              // isDisabled={!exportConfig}
              // onPress={exportConfig ? () => exportTemplate(exportConfig) : undefined}
            >
              {icons.export}
            </Button>
          </Tooltip>
        </li>

        <li>
          <Tooltip content="In" showArrow>
            <Button
              isIconOnly
              aria-label="Print"
              variant="faded"
              color="default"
              className="border-none bg-[#D4D4D866] rounded-lg"
            >
              {icons.print}
            </Button>
          </Tooltip>
        </li>
      </ul>

      <span className="inline-block w-0.5 bg-[#11111126] flex-1" />

      {!hiddenLayoutSwitcher && (
        <>
          <LayoutSwitcher />
          <span className="inline-block w-0.5 bg-[#11111126] flex-1" />
        </>
      )}

      {actions}
    </div>
  );
};
