import { formatVND } from '@/lib/helpers';

export const SalaryDelta = ({ amount }: { amount: number }) => {
  if (amount === 0) return null;
  const isPositive = amount > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
        isPositive ? 'text-emerald-500' : 'text-red-500'
      }`}
    >
      {isPositive ? '▲' : '▼'} {isPositive ? '+' : ''}
      {formatVND(amount)}
    </span>
  );
};
