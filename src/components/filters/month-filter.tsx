/* eslint-disable react-hooks/set-state-in-render */
import { useCallback, useMemo, useState } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Popover, PopoverContent, PopoverTrigger } from '@heroui/react';
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';
import { useTranslation } from 'react-i18next';

import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useQueryFilter } from '@/hooks/useQueryFilter';

import { MONTH_NAMES } from './constants/data';

interface MonthFilterProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export const MonthFilter: React.FC<MonthFilterProps> = ({ value, onChange, className = '' }) => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { filters, setFilter } = useQueryFilter();

  const currentMonth = useMemo<CalendarDate>(() => {
    if (value) {
      const [year, month] = value.split('-').map(Number);
      return new CalendarDate(year!, month!, 1);
    }
    const now = today(getLocalTimeZone());
    return new CalendarDate(now.year, now.month, 1);
  }, [value]);

  const monthAbbrs = useMemo(
    () => Array.from({ length: 12 }, (_, i) => t(`month_filter.abbr.${i}`)),
    [t],
  );

  const monthNames = useMemo(
    () => Array.from({ length: 12 }, (_, i) => t(`month_filter.name.${i}`)),
    [t],
  );

  const monthDisplay = useMemo<string>(() => {
    return `${monthNames[currentMonth.month - 1]} ${currentMonth.year}`;
  }, [currentMonth, monthNames]);

  const [popoverYear, setPopoverYear] = useState<number>(currentMonth.year);

  useMemo(() => {
    setPopoverYear(currentMonth.year);
  }, [currentMonth.year]);

  const handlePreviousMonth = useCallback(() => {
    const prevMonth = currentMonth.subtract({ months: 1 });
    onChange(`${prevMonth.year}-${String(prevMonth.month).padStart(2, '0')}`);
    setFilter('page', 1);
  }, [currentMonth, onChange]);

  const handleNextMonth = useCallback(() => {
    const nextMonth = currentMonth.add({ months: 1 });
    onChange(`${nextMonth.year}-${String(nextMonth.month).padStart(2, '0')}`);
    setFilter('page', 1);
  }, [currentMonth, onChange]);

  const handleSelectMonth = useCallback(
    (monthIndex: number) => {
      const month = String(monthIndex + 1).padStart(2, '0');
      onChange(`${popoverYear}-${month}`);
      setIsOpen(false);
      setFilter('page', 1);
    },
    [popoverYear, onChange],
  );

  const todayDate = today(getLocalTimeZone());

  return (
    <div
      className={cn('flex items-center gap-2 bg-white rounded-xl px-3 h-9 min-w-61.5', className)}
    >
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={handlePreviousMonth}
        className="min-w-8 w-8 h-8"
        aria-label={t('month_filter.prev_month')}
      >
        {icons.arrowLeft}
      </Button>

      <Popover placement="bottom" isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <button
            className="flex-1 text-center text-sm font-medium text-black hover:bg-gray-50 rounded px-2 py-1 transition-colors"
            aria-label={t('month_filter.select_month', { month: monthDisplay })}
          >
            {monthDisplay}
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-4 bg-white rounded-xl shadow-xl mt-2.5">
          <div className="flex flex-col gap-3 w-64">
            <div className="flex items-center justify-between">
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setPopoverYear((y) => y - 1)}
                className="min-w-8 w-8 h-8"
                aria-label={t('month_filter.prev_year')}
              >
                {icons.arrowLeft}
              </Button>

              <span className="text-sm font-bold text-black">{popoverYear}</span>

              <Button
                isIconOnly
                size="sm"
                variant="light"
                onPress={() => setPopoverYear((y) => y + 1)}
                className="min-w-8 w-8 h-8"
                aria-label={t('month_filter.next_year')}
              >
                {icons.arrowRight}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-y-2 gap-x-1">
              {monthAbbrs.map((abbr, idx) => {
                const isSelected =
                  popoverYear === currentMonth.year && idx + 1 === currentMonth.month;
                const isCurrentMonth =
                  popoverYear === todayDate.year && idx + 1 === todayDate.month;

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectMonth(idx)}
                    aria-label={t('month_filter.month_year', { month: idx + 1, year: popoverYear })}
                    aria-pressed={isSelected}
                    className={cn(
                      'h-9 rounded-lg text-sm font-medium transition-colors',
                      isSelected
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : isCurrentMonth
                          ? 'border border-blue-400 text-blue-600 hover:bg-blue-50'
                          : 'text-gray-700 hover:bg-gray-100',
                    )}
                  >
                    {abbr}
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
        onPress={handleNextMonth}
        className="min-w-8 w-8 h-8"
        aria-label={t('month_filter.next_month')}
      >
        {icons.arrowRight}
      </Button>
    </div>
  );
};
