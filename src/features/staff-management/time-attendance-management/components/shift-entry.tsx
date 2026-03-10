import { Card, CardBody, Chip } from '@heroui/react';

import { icons } from '@/lib/icons';

import { ShiftTimeline } from './shift-timeline';
import type { AttendanceDay, TimelineSegment } from '../types';
import { AttendanceExplanationStatus } from '@/types/attendance-explanation.type';
import { formatDate } from '@/lib/utils';
import dayjs from 'dayjs';

export function ShiftEntry({
  date,
  dayOfWeek,
  checkInTime,
  checkOutTime,
  timeline,
  totalHours,
  explanationStatus,
}: AttendanceDay) {
  return (
    <Card className={`rounded-[14px]`}>
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">{dayjs(date).isSame(new Date()) ? "Hôm nay" : dayOfWeek + ", " + formatDate(date)}</h3>
          </div>
          <div className="text-right">
            {explanationStatus === AttendanceExplanationStatus.APPROVED && (
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
        <div className="flex items-center">
          <div className='p-3'>
            <p className="text-sm text-[#A1A1AA] dark:text-gray-400">Chấm công vào</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              {checkInTime ?? "--"}
            </p>
          </div>
          <div className="w-px h-7.5 bg-[#E4E4E7]" />
          <div className="flex-1 h-14">
            <ShiftTimeline timeline={timeline} />
          </div>
          <div className="w-px h-7.5 bg-[#E4E4E7]" />
          <div className="flex items-center justify-between dark:border-slate-700">
            <div className='p-3'>
              <p className="text-xs text-[#A1A1AA] dark:text-gray-400">Chấm công về</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">{checkOutTime ?? "--"}</p>
            </div>
            <div className="w-px h-7.5 bg-[#E4E4E7]" />
            <div className="text-right p-3">
              <p className="text-xs text-[#A1A1AA] dark:text-gray-400">Tổng giờ</p>
              <p className="text-base font-medium text-start  text-gray-900 dark:text-white">
                {totalHours?.toFixed(2) || '--'}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
