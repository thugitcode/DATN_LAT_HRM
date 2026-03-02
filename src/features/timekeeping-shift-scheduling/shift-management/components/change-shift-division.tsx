import { useDrawer } from '@/store/useDrawer';
import { Spinner } from '@heroui/react';

import { LoadingWrapper } from '@/components/loading-wrapper';

import { useShiftManagementDetail } from '../hooks/use-shift-management';
import type { CellDataShift } from '../types/type';
import { CardUserShift } from './card-user-shift';
import { ChangeShiftDivisionForm } from './change-shift-division-form';

export const ChangeShiftDivision = () => {
  const dataRow = useDrawer((state) => state.data) as CellDataShift | undefined;

  const { record, shift, date, day, month, year, dayOfWeek } = dataRow ?? {};

  const { staff, schedules } = record || {};

  console.log('dataRow____________', dataRow);

  const matchedSchedule = schedules?.find((schedule) => schedule.date === date);

  const { data, isLoading } = useShiftManagementDetail(shift?.workScheduleId as string);

  const dataDetail = data?.data;

  return (
    <LoadingWrapper isLoading={isLoading} className="flex flex-col justify-between">
      <CardUserShift
        avatarUrl={dataDetail?.staff?.avatar}
        name={dataDetail?.staff?.name}
        code={dataDetail?.staff?.code}
        startTime={dataDetail?.shiftTemplate?.startTime}
        endTime={dataDetail?.shiftTemplate?.endTime}
        shiftTemplateName={dataDetail?.shiftTemplate?.name}
        workDate={date}
        departmentName={dataDetail?.department?.name}
      />

      <ChangeShiftDivisionForm
        shift={dataDetail?.shiftTemplate}
        staff={staff}
        matchedSchedule={matchedSchedule}
        workScheduleId={shift?.workScheduleId}
      />
    </LoadingWrapper>
  );
};
