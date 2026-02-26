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
    days: Array.from({ length: 7 }, (_, dayIndex) => {
      const isOff = Math.random() < 0.1;
      if (isOff) {
        return {
          date: `${1 + weekIndex * 7 + dayIndex}/2/26`,
          shiftCode: "OFF",
          standardHours: 0,
          checkInTime: null,
          checkOutTime: null,
          lateMinutes: 0,
          earlyLeaveMinutes: 0,
          workUnits: 0,
          totalHours: null,
          overtimeHours: 0,
          compensatoryHours: 0,
        };
      }

      const totalHours = parseFloat((7 + Math.random() * 3).toFixed(1)); // 7-10h
      const overtimeHours = totalHours > 8 ? parseFloat((totalHours - 8).toFixed(1)) : 0;

      return {
        date: `${1 + weekIndex * 7 + dayIndex}/2/26`,
        shiftCode: "CA1",
        standardHours: 8,
        checkInTime: "08:00",
        checkOutTime: totalHours >= 8 ? "17:00" : "16:30",
        lateMinutes: Math.random() < 0.15 ? Math.floor(Math.random() * 30) + 5 : 0,
        earlyLeaveMinutes: totalHours < 8 ? Math.floor((8 - totalHours) * 60) : 0,
        workUnits: totalHours >= 6 ? 1 : totalHours >= 4 ? 0.5 : 0,
        totalHours,
        overtimeHours,
        compensatoryHours: 0,
      };
    }),
  })),
}));
