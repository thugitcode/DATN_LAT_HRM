import { Card, CardBody, Chip } from '@heroui/react';

import { icons } from '@/lib/icons';

import { ShiftTimeline } from './shift-timeline';

interface TimeSlot {
  time: string;
  label: string;
  color: string;
}

interface ShiftEntryProps {
  date: string;
  dayOfWeek: string;
  checkInTime: string;
  timeSlots: TimeSlot[];
  checkInLabel?: string;
  totalHours?: string;
  status?: 'approved' | 'pending' | 'warning' | 'none';
}

const STATUS_COLORS = {
  approved: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
  pending: 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800',
  warning: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
  none: 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800',
};

export function ShiftEntry({
  date,
  dayOfWeek,
  checkInTime,
  timeSlots,
  checkInLabel,
  totalHours,
  status = 'none',
}: ShiftEntryProps) {
  return (
    <Card className={`${STATUS_COLORS[status]} border rounded-[14px]`}>
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{date}</h3>
          </div>
          <div className="text-right">
            {status === 'approved' && (
              <Chip
                size="md"
                variant="flat"
                color="success"
                classNames={{
                  base: 'h-8 w-[116px] px-2',
                  content: 'text-sm font-medium flex-1 text-center',
                }}
                startContent={<icons.tickCircle width={17} height={17} />}
              >
                Đã được duyệt
              </Chip>
            )}
          </div>
        </div>
        <div className="flex">
          <div className='p-3'>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chấm công vào</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
              {checkInTime}
            </p>
          </div>
          <div className="w-px h-8 bg-[#E4E4E7]" />
          <div className="flex-1">
            <ShiftTimeline timeSlots={timeSlots} />
          </div>
          <div className="flex items-center justify-between dark:border-slate-700">
            <div className='p-3'>
              <p className="text-xs text-gray-600 dark:text-gray-400">Chấm công về</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">--</p>
            </div>
            <div className="w-px h-8 bg-[#E4E4E7]" />
            <div className="text-right p-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">Tổng giờ</p>
              <p className="text-medium text-start font-semibold text-gray-900 dark:text-white">
                {totalHours || '--'}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
