/* eslint-disable react-hooks/set-state-in-render */
import { useCallback, useMemo, useState } from 'react';
import { Button, Popover, PopoverContent, PopoverTrigger, Select, SelectItem } from '@heroui/react';
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';

import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';

import { MONTH_NAMES, MONTHS } from './constants/data';
import type { YearOption } from './types/type';

interface MonthFilterProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

const YEAR_RANGE = 5;

export const MonthFilter: React.FC<MonthFilterProps> = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const currentMonth = useMemo<CalendarDate>(() => {
    if (value) {
      const [year, month] = value.split('-').map(Number);

      return new CalendarDate(year, month, 1);
    }
    const now = today(getLocalTimeZone());
    return new CalendarDate(now.year, now.month, 1);
  }, [value]);

  const years = useMemo<YearOption[]>(() => {
    const currentYear = new Date().getFullYear();
    const yearList: YearOption[] = [];
    for (let i = currentYear - YEAR_RANGE; i <= currentYear + YEAR_RANGE; i++) {
      yearList.push({ key: String(i), label: String(i) });
    }
    return yearList;
  }, []);

  const monthDisplay = useMemo<string>(() => {
    return `${MONTH_NAMES[currentMonth.month - 1]} ${currentMonth.year}`;
  }, [currentMonth]);

  const [selectedMonth, setSelectedMonth] = useState<string>(String(currentMonth.month));
  const [selectedYear, setSelectedYear] = useState<string>(String(currentMonth.year));

  useMemo(() => {
    setSelectedMonth(String(currentMonth.month));
    setSelectedYear(String(currentMonth.year));
  }, [currentMonth]);

  const handlePreviousMonth = useCallback(() => {
    const prevMonth = currentMonth.subtract({ months: 1 });
    const formattedMonth = `${prevMonth.year}-${String(prevMonth.month).padStart(2, '0')}`;
    onChange(formattedMonth);
  }, [currentMonth, onChange]);

  const handleNextMonth = useCallback(() => {
    const nextMonth = currentMonth.add({ months: 1 });
    const formattedMonth = `${nextMonth.year}-${String(nextMonth.month).padStart(2, '0')}`;
    onChange(formattedMonth);
  }, [currentMonth, onChange]);

  const handleMonthChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return;
    const selected = Array.from(keys)[0];
    if (selected) {
      setSelectedMonth(String(selected));
    }
  }, []);

  const handleYearChange = useCallback((keys: 'all' | Set<React.Key>) => {
    if (keys === 'all') return;
    const selected = Array.from(keys)[0];
    if (selected) {
      setSelectedYear(String(selected));
    }
  }, []);

  const handleApply = useCallback(() => {
    const month = selectedMonth.padStart(2, '0');
    const formattedMonth = `${selectedYear}-${month}`;
    onChange(formattedMonth);
    setIsOpen(false);
  }, [selectedMonth, selectedYear, onChange]);

  return (
    <div
      className={cn(
        'flex items-center gap-2 bg-white rounded-xl px-3 h-11.5 min-w-61.5',
        className,
      )}
    >
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={handlePreviousMonth}
        className="min-w-8 w-8 h-8"
        aria-label="Tháng trước"
      >
        {icons.arrowLeft}
      </Button>

      <Popover placement="bottom" isOpen={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger>
          <button
            className="flex-1 text-center text-sm font-medium text-black hover:bg-gray-50 rounded px-2 py-1 transition-colors"
            aria-label={`Chọn tháng, hiện tại: ${monthDisplay}`}
          >
            {monthDisplay}
          </button>
        </PopoverTrigger>
        <PopoverContent className="p-4 bg-white rounded-xl shadow-lg">
          <div className="flex flex-col gap-3 w-70">
            <div className="text-sm font-semibold text-black">Chọn tháng và năm</div>

            <Select
              label="Tháng"
              placeholder="Chọn tháng"
              selectedKeys={[selectedMonth]}
              onSelectionChange={handleMonthChange}
              classNames={{
                trigger: 'bg-gray-50 border-none shadow-none rounded-lg',
                value: 'text-black',
                label: 'text-black text-xs',
              }}
            >
              {MONTHS.map((month) => (
                <SelectItem key={month.key}>{month.label}</SelectItem>
              ))}
            </Select>

            <Select
              label="Năm"
              placeholder="Chọn năm"
              selectedKeys={[selectedYear]}
              onSelectionChange={handleYearChange}
              classNames={{
                trigger: 'bg-gray-50 border-none shadow-none rounded-lg',
                value: 'text-black',
                label: 'text-black text-xs',
              }}
            >
              {years.map((year) => (
                <SelectItem key={year.key}>{year.label}</SelectItem>
              ))}
            </Select>

            <Button color="primary" onPress={handleApply} className="w-full">
              Áp dụng
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={handleNextMonth}
        className="min-w-8 w-8 h-8"
        aria-label="Tháng sau"
      >
        {icons.arrowRight}
      </Button>
    </div>
  );
};
