import { useCallback, useMemo, useState } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { getLocalTimeZone, today } from '@internationalized/date';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useQueryFilter } from '@/hooks/useQueryFilter';

interface YearFilterProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export const YearFilter: React.FC<YearFilterProps> = ({ value, onChange, className = '' }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [decadeOffset, setDecadeOffset] = useState<number>(0);
  const { setFilter } = useQueryFilter();

  const todayDate = today(getLocalTimeZone());

  const currentYear = useMemo<number>(() => {
    if (value) return parseInt(value, 10);
    return todayDate.year;
  }, [value, todayDate.year]);

  const decadeStart = Math.floor(currentYear / 10) * 10 + decadeOffset * 10;

  const years = useMemo(() => Array.from({ length: 12 }, (_, i) => decadeStart + i), [decadeStart]);

  const handlePreviousYear = useCallback(() => {
    onChange(String(currentYear - 1));
    setFilter('page', 1);
  }, [currentYear, onChange, setFilter]);

  const handleNextYear = useCallback(() => {
    onChange(String(currentYear + 1));
    setFilter('page', 1);
  }, [currentYear, onChange, setFilter]);

  const handleSelectYear = useCallback(
    (year: number) => {
      onChange(String(year));
      setIsOpen(false);
      setDecadeOffset(0);
      setFilter('page', 1);
    },
    [onChange, setFilter],
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
    if (!open) setDecadeOffset(0);
  }, []);

  return (
    <div
      className={cn('flex items-center gap-2 bg-white rounded-xl px-3 h-9 min-w-61.5', className)}
    >
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={handlePreviousYear}
        className="min-w-8 w-8 h-8"
        aria-label="Năm trước"
      >
        {icons.arrowLeft}
      </Button>

      <Popover placement="bottom" isOpen={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger>
          <button
            className="flex-1 text-center text-sm font-medium text-black hover:bg-gray-50 rounded px-2 py-1 transition-colors"
            aria-label={`Chọn năm, hiện tại: ${currentYear}`}
          >
            Năm {currentYear}
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-4 bg-white rounded-xl shadow-xl mt-2.5">
          <div className="flex flex-col gap-3 w-56">
            <div className="flex items-center justify-between">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setDecadeOffset((o) => o - 1)}
                className="min-w-8 w-8 h-8"
                aria-label="Thập kỷ trước"
              >
                {icons.arrowLeft}
              </Button>

              <span className="text-sm font-bold text-black">
                {decadeStart} – {decadeStart + 9}
              </span>

              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setDecadeOffset((o) => o + 1)}
                className="min-w-8 w-8 h-8"
                aria-label="Thập kỷ sau"
              >
                {icons.arrowRight}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-y-2 gap-x-1">
              {years.map((year) => {
                const isSelected = year === currentYear;
                const isCurrentYear = year === todayDate.year;

                return (
                  <button
                    key={year}
                    onClick={() => handleSelectYear(year)}
                    aria-label={`Năm ${year}`}
                    aria-pressed={isSelected}
                    className={cn(
                      'h-9 rounded-lg text-sm font-medium transition-colors',
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isCurrentYear
                          ? 'border border-blue-400 text-blue-600 hover:bg-blue-50'
                          : 'text-gray-700 hover:bg-gray-100',
                    )}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={handleNextYear}
        className="min-w-8 w-8 h-8"
        aria-label="Năm sau"
      >
        {icons.arrowRight}
      </Button>
    </div>
  );
};
