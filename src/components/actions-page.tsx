import type { FC, ReactNode } from 'react';
import { Button, Tooltip } from '@heroui/react';

import { icons } from '@/lib/icons';
import { useExcelIO } from '@/hooks/use-excel-io';
import type { ExcelExportConfig, ExcelImportConfig } from '@/hooks/use-excel-io';
import { useQueryFilter } from '@/hooks/useQueryFilter';

import { LayoutSwitcher } from './layout-switcher';

interface ActionsPageProps<T = Record<string, unknown>> {
  actions?: ReactNode;
  hiddenLayoutSwitcher?: boolean;
  exportConfig?: ExcelExportConfig<T>;
  exportTemplateConfig?: ExcelExportConfig<T>;
  importConfig?: ExcelImportConfig<T>;
}

export const ActionsPage = <T = Record<string, unknown>,>({
  actions,
  hiddenLayoutSwitcher = false,
  exportConfig,
  exportTemplateConfig,
  importConfig,
}: ActionsPageProps<T>) => {
  const { clearFilters } = useQueryFilter({ replace: true });
  const { fileInputRef, exportToExcel, exportTemplate, triggerImport, handleFileChange } =
    useExcelIO();

  return (
    <div className="flex items-stretch gap-3">
      <ul className="flex items-center gap-2">
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

        {importConfig && (
          <li>
            <Tooltip content="Nhập file excel" showArrow>
              <Button
                isIconOnly
                aria-label="Import excel"
                variant="faded"
                color="default"
                className="border-none bg-[#D4D4D866] rounded-lg"
                onPress={triggerImport}
              >
                I
              </Button>
            </Tooltip>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileChange(e, importConfig)}
            />
          </li>
        )}

        {/* <li>
          <Tooltip content="Xuất file excel" showArrow>
            <Button
              isIconOnly
              aria-label="Export excel"
              variant="faded"
              color="default"
              className="border-none bg-[#D4D4D866] rounded-lg"
              isDisabled={!exportConfig}
              onPress={exportConfig ? () => exportToExcel(exportConfig) : undefined}
            >
              {icons.export}
            </Button>
          </Tooltip>
        </li> */}

        {/* <li>
          <Tooltip content="Xuất file mẫu" showArrow>
            <Button
              isIconOnly
              aria-label="Export excel template"
              variant="faded"
              color="default"
              className="border-none bg-[#D4D4D866] rounded-lg"
              isDisabled={!exportTemplateConfig}
              onPress={exportTemplateConfig ? () => exportToExcel(exportTemplateConfig) : undefined}
            >
              {icons.exportSampleFile}
            </Button>
          </Tooltip>
        </li> */}
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
