import { cn } from '@/lib/utils';

interface StatItemProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export const StatItem = ({ label, value, valueClassName = 'text-blue-600' }: StatItemProps) => (
  <div className="flex flex-col gap-1 p-3">
    <span className="text-sm text-black">{label}</span>
    <span className={cn('text-2xl font-medium text-[#006FEE]', valueClassName)}>{value}</span>
  </div>
);
