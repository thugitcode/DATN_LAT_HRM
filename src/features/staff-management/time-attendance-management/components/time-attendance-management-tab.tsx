import { ShiftEntry } from './shift-entry';
import { StatsSection } from './stats-section';
const mockShifts = [
  {
    date: 'Monday, 26/1/2026',
    dayOfWeek: 'Monday',
    checkInTime: '08:30 AM',
    checkInLabel: 'Check In',
    timeSlots: [
      { time: '08:30', label: 'Work', color: 'bg-blue-500' },
      { time: '11:30', label: 'Work', color: 'bg-blue-500' },
      { time: '13:30', label: 'Business Trip', color: 'bg-blue-500' },
      { time: '15:30', label: 'Work', color: 'bg-blue-500' },
      { time: '17:30', label: 'Work', color: 'bg-blue-500' },
      { time: '19:00', label: 'OT', color: 'bg-blue-600' },
      { time: '21:00', label: 'OT', color: 'bg-blue-600' },
    ],
    totalHours: '10h30',
    status: 'none' as const,
  },
  {
    date: 'Monday, 26/1/2026',
    dayOfWeek: 'Monday',
    checkInTime: '08:30 AM',
    checkInLabel: 'Check In',
    timeSlots: [
      { time: '08:30', label: 'Leave', color: 'bg-amber-500' },
      { time: '11:30', label: 'Leave', color: 'bg-amber-500' },
      { time: '13:30', label: 'Leave', color: 'bg-amber-500' },
      { time: '15:30', label: 'Leave', color: 'bg-amber-500' },
      { time: '17:30', label: 'Leave', color: 'bg-amber-500' },
      { time: '19:00', label: 'Leave', color: 'bg-amber-500' },
      { time: '21:00', label: 'Leave', color: 'bg-amber-500' },
    ],
    totalHours: '--',
    status: 'approved' as const,
  },
  {
    date: 'Saturday, 26/1/2026',
    dayOfWeek: 'Saturday',
    checkInTime: '09:30 AM',
    checkInLabel: 'Check In',
    timeSlots: [
      { time: '08:30', label: 'Late', color: 'bg-red-500' },
      { time: '11:30', label: 'Work', color: 'bg-blue-500' },
      { time: '13:30', label: 'Business Trip', color: 'bg-blue-500' },
      { time: '15:30', label: 'Work', color: 'bg-blue-500' },
      { time: '17:30', label: 'Work', color: 'bg-blue-500' },
      { time: '19:00', label: 'Work', color: 'bg-blue-500' },
    ],
    totalHours: '--',
    status: 'none' as const,
  },
  {
    date: 'Monday, 26/1/2026',
    dayOfWeek: 'Monday',
    checkInTime: '08:30 AM',
    checkInLabel: 'Check In',
    timeSlots: [
      { time: '08:30', label: 'Leave', color: 'bg-amber-500' },
      { time: '11:30', label: 'Leave', color: 'bg-amber-500' },
      { time: '13:30', label: 'Leave', color: 'bg-amber-500' },
      { time: '15:30', label: 'Leave', color: 'bg-amber-500' },
      { time: '17:30', label: 'Leave', color: 'bg-amber-500' },
      { time: '19:00', label: 'Leave', color: 'bg-amber-500' },
      { time: '21:00', label: 'Leave', color: 'bg-amber-500' },
    ],
    totalHours: '--',
    status: 'warning' as const,
  },
]
export const TimeAttendanceManagementTab = () => {
  return (
    <div className='flex flex-col gap-6'>
      <StatsSection />
      <div className="space-y-4">
          {mockShifts.map((shift, idx) => (
            <ShiftEntry key={idx} {...shift} />
          ))}
        </div>
    </div>
  );
};
