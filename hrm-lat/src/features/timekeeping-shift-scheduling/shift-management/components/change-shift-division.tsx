import { useDrawer } from '@/store/useDrawer';

import { LoadingWrapper } from '@/components/loading-wrapper';

import { useShiftManagementDetail } from '../hooks/use-shift-management';
import type { CellDataShift } from '../types/type';
import { CardUserShift } from './card-user-shift';
import { ChangeShiftDivisionForm } from './change-shift-division-form';

export const ChangeShiftDivision = () => {
  const dataRow = useDrawer((state) => state.data) as CellDataShift | undefined;

  const { record, shift, date, day, month, year, dayOfWeek } = dataRow ?? {};

  const { staff, schedules } = record || {};

  const matchedSchedule = schedules?.find((schedule) => schedule.date === date);

  const { data, isLoading } = useShiftManagementDetail(shift?.workScheduleId as string);

  const dataDetail = data?.data;

  return (
    <LoadingWrapper isLoading={isLoading} className="flex flex-col justify-between">
      <CardUserShift
        workDate={date}
        avatarUrl={dataDetail?.staff?.avatar}
        name={dataDetail?.staff?.name}
        code={dataDetail?.staff?.code}
        startTime={dataDetail?.shiftTemplate?.startTime}
        endTime={dataDetail?.shiftTemplate?.endTime}
        shiftTemplateName={dataDetail?.shiftTemplate?.name}
        departmentName={dataDetail?.department?.name}
        type={dataDetail?.shiftTemplate?.type}
        standardHours={dataDetail?.shiftTemplate?.standardHours}
      />

      <ChangeShiftDivisionForm
        shift={dataDetail?.shiftTemplate}
        staffRow={staff}
        matchedSchedule={matchedSchedule}
        workScheduleId={shift?.workScheduleId}
        shiftRow={shift}
        note={dataDetail?.note}
        department={dataDetail?.department}
        room={dataDetail?.room}
      />
    </LoadingWrapper>
  );
};
