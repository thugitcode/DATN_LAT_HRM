import { useDrawer } from '@/store/useDrawer';

import type { CellDataShift } from '../types/type';
import { CardUserShift } from './card-user-shift';
import { ChangeShiftDivisionForm } from './change-shift-division-form';

export const ChangeShiftDivision = () => {
  const data = useDrawer((state) => state.data) as CellDataShift | undefined;

  const { record, shift, date, day, month, year, dayOfWeek } = data ?? {};

  const { staff, schedules } = record || {};

  const matchedSchedule = schedules?.find((schedule) => schedule.date === date);

  const matchedShift = matchedSchedule?.shifts?.find(
    (s) => s.workScheduleId === shift?.workScheduleId,
  );

  console.log('_______________________', {
    shift,
    schedules,
    matchedSchedule,
    matchedShift,
  });

  return (
    <div className="flex flex-col justify-between size-full">
      <CardUserShift
        avatarUrl={staff?.avatar}
        name={staff?.name}
        code={staff?.code}
        startTime={shift?.startTime}
        endTime={shift?.endTime}
        shiftTemplateName={shift?.shiftTemplateName}
        workDate={date}
      />

      <ChangeShiftDivisionForm shift={shift} staff={staff} matchedSchedule={matchedSchedule} />
    </div>
  );
};
