import type { FC } from 'react';

import type { Staff } from '@/types/shift-management.type';
import { formatVND } from '@/lib/helpers';

import { SalaryDelta } from './salary-delta';
import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

interface SalaryHeaderProps {
  staff: Staff;
  latestSalary: number;
  delta: number;
}

export const SalaryHeader: FC<SalaryHeaderProps> = ({ staff, latestSalary, delta }) => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT)
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0">
          <StaffAvatar avatarUrl={staff.avatar} name={staff.name} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{staff.name}</p>
          <p className="text-xs text-gray-400">
            {staff.code} · {staff.position}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2">
        <span className="text-xs text-gray-500 font-medium">{t('salary-history.current_salary')}</span>
        <span className="text-base font-bold text-blue-600">{formatVND(latestSalary)}</span>
        {delta !== 0 && <SalaryDelta amount={delta} />}
      </div>
    </div>
  )
};
