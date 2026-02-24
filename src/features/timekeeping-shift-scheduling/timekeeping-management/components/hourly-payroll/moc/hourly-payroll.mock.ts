import { HourlyPayrollStatus, type HourlyPayrollRecord } from '../../../types/index.type';

export const hourlyPayrollMock: HourlyPayrollRecord[] = Array.from({ length: 20 }, (_, index) => ({
  id: `${index + 1}`,
  department: 'Khoa phục hồi chức năng',
  room: 'Phòng: Hồi sức',
  staffCode: `20${index + 1}`,
  staffName: `Alan Hanh Nguyen ${index + 1}`,
  position: 'BA',
  weeks: Array.from({ length: 4 }, (__, weekIndex) => ({
    weekNumber: weekIndex + 1,
    from: `${1 + weekIndex * 7}/1/26`,
    to: `${7 + weekIndex * 7}/1/26`,
    days: Array.from({ length: 7 }, (___, dayIndex) => {
      const hours = Math.random() > 0.1 ? parseFloat((7 + Math.random() * 2).toFixed(1)) : null; // 10% nghỉ
      let status: HourlyPayrollStatus;
      if (hours === null) status = HourlyPayrollStatus.OFF;
      else if (hours < 8) status = HourlyPayrollStatus.SHORTAGE;
      else if (hours > 8) status = HourlyPayrollStatus.OVERTIME;
      else status = HourlyPayrollStatus.FULL_HOURS;

      return {
        date: `${1 + weekIndex * 7 + dayIndex}/1/26`,
        hours,
        status,
      };
    }),
  })),
}));
