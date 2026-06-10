import { cn } from '@/lib/utils';

interface CostItemProps {
  dotColor: string;
  label: string;
  value: string;
  valueClassName: string;
}

export const CostItem = ({ dotColor, label, value, valueClassName }: CostItemProps) => (
  <div className="flex flex-col gap-1 p-3">
    <div className="flex items-center gap-2 text-sm text-black">
      <span
        aria-hidden
        className="inline-block h-3 w-3 rounded-md"
        style={{ backgroundColor: dotColor }}
      />
      {label}
    </div>
    <span className={cn('text-2xl font-medium text-[#6576FF]', valueClassName)}>{value}</span>
  </div>
);
