import { useDrawer } from '@/store/useDrawer';

import type { Shift, StaffSchedule } from '@/types';

import { CardUserShift } from './card-user-shift';
import { ChangeShiftDivisionForm } from './change-shift-division-form';

export interface ChangeShiftDivisionData {
  record: StaffSchedule;
  shift: Shift;
  date: string;
  day: number;
  month: number;
  year: number;
  dayOfWeek: number;
}

export const ChangeShiftDivision = () => {
  const data = useDrawer((state) => state.data) as ChangeShiftDivisionData | undefined;

  console.log('data in ChangeShiftDivisionForm', data);
  const { record, shift, date, day, month, year, dayOfWeek } = data ?? {};

  console.log('record in ChangeShiftDivisionForm', {
    record,
    shift,
    date,
    day,
    month,
    year,
    dayOfWeek,
  });

  const { staff } = record || {};
  return (
    <div className="size-full flex flex-col justify-between">
      <CardUserShift
        avatarUrl={staff?.avatar}
        name={staff?.name}
        code={staff?.code}
        startTime={shift?.startTime}
        endTime={shift?.endTime}
        shiftTemplateName={shift?.shiftTemplateName}
        workDate={date}
      />

      <ChangeShiftDivisionForm />
    </div>
  );
};
