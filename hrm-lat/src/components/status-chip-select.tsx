import { useRef, useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';

export interface StatusOption {
  key: string;
  label: string;
  /** Tailwind text color class, e.g. "text-[#006FEE]" */
  color: string;
  /** Tailwind bg class, e.g. "bg-[#EEF5FF]" */
  bg: string;
}

interface StatusChipSelectProps {
  value: string;
  options: StatusOption[];
  onSelect: (key: string) => void;
  isPending?: boolean;
  classNames?: {
    trigger?: string;
    dropdown?: string;
    option?: string;
  }
}

export function StatusChipSelect({ value, options, onSelect, isPending = false, classNames }: StatusChipSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find((o) => o.key === value);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) {
      setOpen(false);
    }
  };

  const handleSelect = (key: string) => {
    if (key === value || isPending) return;
    setOpen(false);
    onSelect(key);
  };

  if (!current) return null;

  return (
    <div ref={ref} className="relative" onBlur={handleBlur} tabIndex={-1}>
      {/* Trigger */}
      <button
        type="button"
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className={`
          inline-flex items-center gap-1 text-xs font-normal px-2.5 py-1 rounded-full
          cursor-pointer select-none transition-opacity
          ${current.bg} ${current.color}
          ${isPending ? 'opacity-60 cursor-wait' : 'hover:opacity-80'}
          ${classNames?.trigger}
        `}
      >
        {current.label}
        <IconChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className={`absolute right-0 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-[#E4E4E7] py-1 min-w-[180px] ${classNames?.dropdown}`}>
          {options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              tabIndex={0}
              onClick={() => handleSelect(opt.key)}
              className={`
                w-full flex items-center gap-2 px-3 py-2 text-left text-sm
                hover:bg-[#F4F4F5] transition-colors
                ${opt.key === value ? 'bg-[#F4F4F5]' : ''}
                ${classNames?.option}
              `}
            >
              <span className={`inline-block text-xs font-normal px-2 py-0.5 rounded-full ${opt.bg} ${opt.color}`}>
                {opt.label}
              </span>
              {opt.key === value && <span className="ml-auto text-primary text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
