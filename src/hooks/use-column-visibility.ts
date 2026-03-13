import { useCallback, useMemo, useState } from 'react';

import type { ColumnDef } from '@/components/data-table/data-table';

interface UseColumnVisibilityOptions<T extends object> {
  columns: ColumnDef<T>[];
}

interface UseColumnVisibilityReturn {
  visibleColumns: Set<string>;
  handleApplyColumns: (visibleKeys: Set<string>, saveAsDefault: boolean) => void;
  exportableColumns: Set<string>;
}

export const useColumnVisibility = <T extends object>({
  columns,
}: UseColumnVisibilityOptions<T>): UseColumnVisibilityReturn => {
  const defaultVisibleColumns = useMemo(
    () => new Set(columns.map((col) => col.key)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(defaultVisibleColumns);

  const handleApplyColumns = useCallback((visibleKeys: Set<string>, _saveAsDefault: boolean) => {
    setVisibleColumns(visibleKeys);
  }, []);

  const exportableColumns = useMemo(
    () => new Set([...visibleColumns].filter((k) => k !== 'actions')),
    [visibleColumns],
  );

  return {
    visibleColumns,
    handleApplyColumns,
    exportableColumns,
  };
};
