import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export const SectionCardOtherIncome = ({ title, children }: SectionCardProps) => (
  <div className="rounded-xl border border-[#11111126] bg-white">
    <div className="text-[18px] font-semibold bg-[#F4F4F5] p-3 text-[#11181C]">{title}</div>
    <div className="px-6 py-1.5">{children}</div>
  </div>
);
