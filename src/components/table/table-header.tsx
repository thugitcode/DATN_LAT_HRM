export const TableHeader = () => {
  return (
    <thead className="sticky top-0 z-30">
      {headerStructure.rows.map((row, rowIndex) => (
        <tr key={`header-row-${rowIndex}`}>
          {row.map((col, colIndex) => {
            const headerCellProps = col.onHeaderCell?.() ?? {};
            const isFixed = Boolean(col.fixed);
            const fixedStyle = calculateFixedPosition(
              headerStructure.leafColumns,
              colIndex,
              col.fixed,
            );

            return (
              <th
                key={`${col.key}-${colIndex}`}
                colSpan={col.colSpan}
                rowSpan={col.rowSpan}
                className={cn(
                  'px-4 py-3 font-semibold text-xs text-[#71717A] bg-[#F4F4F5]',
                  bordered && 'border border-gray-300',
                  isFixed && 'sticky z-40',
                  getAlignClass(col.align),
                  SIZE_CLASSES[size],
                  col.className,
                )}
                style={{
                  width: col.width,
                  ...fixedStyle,
                  ...headerCellProps.style,
                }}
                {...headerCellProps}
              >
                {col.title}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
};
