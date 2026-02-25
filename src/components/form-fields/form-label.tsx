import type { FC } from 'react';

import { cn } from '@/lib/utils';

interface FormLabelProps {
  label?: string;
  isRequired?: boolean;
  isError?: boolean;
}

export const FormLabel: FC<Readonly<FormLabelProps>> = ({ label, isRequired, isError }) => {
  return (
    <label
      className={cn(
        'text-xs font-normal leading-4 text-[#52525B]',
        isError ? 'text-[#F31260]' : 'text-[#52525B]',
      )}
    >
      {label} {isRequired && <span className="text-[#F31260]">*</span>}
    </label>
  );
};
