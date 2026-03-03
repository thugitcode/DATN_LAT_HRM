import { ExplanationManagement } from '@/features/timekeeping-shift-scheduling/explanation-management/explanation-management';
import { TAB_KEYS } from './contants/data';
import { useTimeAttendanceTabs } from './hooks/use-time-attendance-tabs';
import AttendanceSummary from './components/attendance-summary';
import { ShiftEntry } from './components/shift-entry';
import { Header } from './components/header';
import { ShiftExplanation } from './components/shift-explanation';
import { PageFilter } from '@/features/timekeeping-shift-scheduling/components/page-filter';
import { ShiftManagementGrid } from '@/features/timekeeping-shift-scheduling/shift-management/components/grid-layout/shift-management-grid';
import { ShiftManagementContainer } from './components/shift-management-container';
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
  const { activeKey } = useTimeAttendanceTabs()

  return (
    <div className='flex flex-col'>
      <div className='mb-5'>
        <PageFilter />
      </div>
      <Header />
      {
        TAB_KEYS.WORKSHEET_BY_SHIFT === activeKey && <div className="space-y-4">
          <AttendanceSummary />

          {mockShifts.map((shift, idx) => (
            <ShiftEntry key={idx} {...shift} />
          ))}
        </div>
      }
      {
        TAB_KEYS.SHIFT_EXPLANATION === activeKey && <ShiftExplanation />
      }
      {
        TAB_KEYS.SHIFT_ASSIGNMENT === activeKey && <ShiftManagementContainer />
      }
    </div>
  );
};
