import { Card, CardBody, Chip } from '@heroui/react';
import dayjs from 'dayjs';

import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';
import { formatDate } from '@/lib/utils';
import { AttendanceExplanationStatus } from '@/types/attendance-explanation.type';
import { useTranslation } from 'react-i18next';

import { type AttendanceDay } from '../../types/types';
import { ShiftTimeline } from './shift-timeline';
import { convertTimeLine } from '../helpers';

export function ShiftEntry({
  date,
  checkInTime,
  checkOutTime,
  timeline,
  totalHours,
  explanationStatus,
  lateMinutes,
  earlyMinutes,
  allowedLateMinutes,
  allowedEarlyLeaveMinutes,
  displayCode
}: AttendanceDay) {

  const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);

  return (
    <Card className={`rounded-[14px] shadow-sm`}>
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white">
              {dayjs(date).isSame(new Date())
                ? t('shiftEntry.today')
                : t(`contract_info.days.${dayjs(date).day() === 0 ? '0' : dayjs(date).day() + 1}` as any) +
                ', ' +
                formatDate(date)}
            </h3>
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
                {t('shiftEntry.approved')}
              </Chip>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <div className="p-3">
            <p className="text-sm text-[#A1A1AA] dark:text-gray-400">{t('shiftEntry.checkIn')}</p>
            <p className="text-base font-medium text-gray-900 dark:text-white mt-1">
              {checkInTime ?? '--'}
            </p>
          </div>
          <div className="w-px h-7.5 bg-[#E4E4E7]" />
          <div className="flex-1 h-14">
            <ShiftTimeline
              timeline={convertTimeLine({ timeline, lateMinutes, earlyMinutes, checkInTime, checkOutTime, allowedLateMinutes, t }) ?? []}
              checkInTime={checkInTime}
              checkOutTime={checkOutTime}
            />
          </div>
          <div className="w-px h-7.5 bg-[#E4E4E7]" />
          <div className="flex items-center justify-between dark:border-slate-700">
            <div className="p-3">
              <p className="text-xs text-[#A1A1AA] dark:text-gray-400">{t('shiftEntry.checkOut')}</p>
              <p className="text-base font-medium text-gray-900 dark:text-white">
                {checkOutTime ?? '--'}
              </p>
            </div>
            <div className="w-px h-7.5 bg-[#E4E4E7]" />
            <div className="text-right p-3">
              <p className="text-xs text-[#A1A1AA] dark:text-gray-400">{t('shiftEntry.totalHours')}</p>
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
