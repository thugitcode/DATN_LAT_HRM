import { useStaffDailyAttendance } from "@/features/timekeeping-shift-scheduling/shift-management/hooks/use-shift-management";
import { useMonthDateRange } from "@/hooks/use-month-date-range";
import { useQueryFilter } from "@/hooks/useQueryFilter";
import { useDrawer } from "@/store/useDrawer";
import type { ShiftManagementParams } from "@/types";

export const TimekeepingDetails = () => {
  const { data: id } = useDrawer()
  console.log(id, 7777);
  const { filters } = useQueryFilter<ShiftManagementParams>();
  const { startDate, endDate } = useMonthDateRange(filters.month);

  const { data: details, isLoading } = useStaffDailyAttendance({
    page: filters.page ?? 1,
    limit: filters.limit ?? 10,
    fromDate: startDate,
    toDate: endDate,
    search: filters.search,
    departmentId: filters.departmentId,
    roomId: filters.roomId,
    staffId: id as string
  });
  console.log(details, 99999);

  return <div>TimekeepingDetails</div>;
};
