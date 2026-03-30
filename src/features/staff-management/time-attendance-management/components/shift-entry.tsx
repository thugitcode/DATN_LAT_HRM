import { Card, CardBody, Chip } from '@heroui/react';
import dayjs from 'dayjs';

import { AttendanceExplanationStatus } from '@/types/attendance-explanation.type';
import { icons } from '@/lib/icons';
import { formatDate } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

import { ETimelineType, type AttendanceDay, type TimelineSegment } from '../types';
import { ShiftTimeline } from './shift-timeline';
import { parseMins } from '../helpers';

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
  type ConvertTimelineInput = {
    timeline: TimelineSegment[];
    lateMinutes: number;
    earlyMinutes: number;
    checkInTime?: string | null;
    checkOutTime?: string | null;
    t: any;
  };

  const convertTimeLine = ({
    timeline,
    lateMinutes,
    earlyMinutes,
    checkInTime,
    checkOutTime,
    t,
  }: ConvertTimelineInput): TimelineSegment[] => {
    const hasLate = lateMinutes > 0;
    const hasEarly = earlyMinutes > 0;
    const isMissingCheckIn = !checkInTime;
    const isMissingCheckOut = !checkOutTime;

    // ===== 1. Normalize data (rule business) =====
    let normalizedTimeline: TimelineSegment[] = [];

    // Process LEAVE KL specifically
    for (const item of timeline) {
      if (item.type === 'LEAVE') {
        const hasCheckIn = !!checkInTime;
        const hasCheckOut = !!checkOutTime;
        const type = item.label === 'KL' ? ETimelineType.UNAUTHORIZED_LEAVE : ETimelineType.LEAVE;
        if (hasCheckIn || hasCheckOut) {
          // const parseMins = (str?: string | null) => {
          //   if (!str) return null;
          //   let hh = 0, mm = 0;
          //   const match = str.match(/(\d+):(\d+)/);
          //   if (match) {
          //     hh = parseInt(match[1] || '0', 10);
          //     mm = parseInt(match[2] || '0', 10);
          //   }
          //   if (str.toLowerCase().includes('pm') && hh < 12) hh += 12;
          //   // handle the "12:xx AM" edge case where it means noon
          //   if (str.toLowerCase().includes('am') && hh === 12) hh = 12;
          //   return hh * 60 + mm;
          // };

          const sMin = parseMins(item.startTime) ?? 0;
          const eMin = parseMins(item.endTime) ?? 0;
          const iMin = parseMins(checkInTime);
          const oMin = parseMins(checkOutTime);

          const baseItem = { ...item, type: type };

          // Gap before Check-in
          if (iMin !== null && iMin - sMin > allowedLateMinutes) {
            normalizedTimeline.push({ ...baseItem, endTime: checkInTime! });
          }

          // Work block
          const wStart = (iMin !== null && iMin > sMin) ? checkInTime! : item.startTime;
          const wEnd = (oMin !== null && oMin < eMin) ? checkOutTime! : item.endTime;

          normalizedTimeline.push({
            ...baseItem,
            type: ETimelineType.WORK,
            label: 'Làm việc',
            startTime: wStart,
            endTime: wEnd,
            color: '#3874B8',
          });

          // Gap after Check-out
          if (oMin !== null && oMin < eMin) {
            normalizedTimeline.push({ ...baseItem, startTime: checkOutTime! });
          }

          continue;
        }

        normalizedTimeline.push({
          ...item,
          type: type,
        });
        continue;
      }
      normalizedTimeline.push(item);
    }

    // Lọc bỏ các khối trùng bắt đầu/kết thúc do chia khối
    normalizedTimeline = normalizedTimeline.filter(item => item.startTime !== item.endTime);

    // ===== 2. Update WORK segments =====
    const updatedTimeline = [...normalizedTimeline];

    // đi muộn → sửa WORK đầu
    if (hasLate && checkInTime) {
      const idx = updatedTimeline.findIndex((i) => i.type === 'WORK');
      if (idx !== -1) {
        updatedTimeline[idx] = {
          ...updatedTimeline[idx],
          startTime: checkInTime,
        } as TimelineSegment;
      }
    }

    // về sớm → sửa WORK cuối
    if (hasEarly && checkOutTime) {
      const reverseIdx = [...updatedTimeline]
        .reverse()
        .findIndex((i) => i.type === 'WORK');

      if (reverseIdx !== -1) {
        const realIdx = updatedTimeline.length - 1 - reverseIdx;
        updatedTimeline[realIdx] = {
          ...updatedTimeline[realIdx],
          endTime: checkOutTime,
        } as TimelineSegment;
      }
    }

    // Derive actual shift start/end times from normalized timeline
    const shiftStartTime = updatedTimeline[0]?.startTime ?? '';
    const shiftEndTime = updatedTimeline[updatedTimeline.length - 1]?.endTime ?? '';

    // ===== 3. Build extra segments =====
    const extraSegments: TimelineSegment[] = [];

    // quên chấm công
    const isLeavePN = timeline.some(item => item.type === 'LEAVE' && item.label === 'PN');
    const isLeaveKL = timeline.some(item => item.type === 'LEAVE' && item.label === 'KL');
    if ((isMissingCheckIn || isMissingCheckOut) && updatedTimeline.length > 0 && !isLeavePN) {
      extraSegments.push({
        type: ETimelineType.FORGOT_TO_CLOCK_TIME,
        label: t('shiftEntry.forgotClockTime'),
        startTime: checkInTime ?? shiftStartTime,
        endTime: checkOutTime ?? shiftEndTime,
        color: '#F59E0B',
      });
    }

    // late
    if (hasLate && checkInTime) {
      extraSegments.push({
        type: ETimelineType.LATE,
        label: t('shiftEntry.late'),
        startTime: '',
        endTime: checkInTime,
        color: '#EF4444',
      });
    }

    // early
    if (hasEarly && checkOutTime && !isLeaveKL) {
      extraSegments.push({
        type: ETimelineType.EARLY,
        label: t('shiftEntry.early'),
        startTime: checkOutTime,
        endTime: shiftEndTime,  // actual shift end, not empty
        color: '#EF4444',
      });
    }

    // ===== 4. Compose final timeline =====
    const result: TimelineSegment[] = [
      // ưu tiên hiển thị: forgot → late → timeline → early
      ...extraSegments.filter(i => i.type === ETimelineType.FORGOT_TO_CLOCK_TIME),
      ...extraSegments.filter(i => i.type === ETimelineType.LATE),
      ...updatedTimeline,
      ...extraSegments.filter(i => i.type === ETimelineType.EARLY),
    ];
    if (timeline.some(item => item.type === 'WFH')) {
      return [{
        type: ETimelineType.WFH,
        label: t('shiftEntry.wfh'),
        startTime: checkInTime ?? shiftStartTime,
        endTime: checkOutTime ?? shiftEndTime,
        color: '#F59E0B',
      }];
    }
    if (timeline.some(item => item.type === 'BUSINESS_TRIP')) {
      return [{
        type: ETimelineType.BUSINESS_TRIP,
        label: t('shiftEntry.businessTrip'),
        startTime: checkInTime ?? shiftStartTime,
        endTime: checkOutTime ?? shiftEndTime,
        color: '#F5A524',
      }];
    }
    if ((isMissingCheckIn && isMissingCheckOut) && updatedTimeline.length > 0 && !isLeavePN && !isLeaveKL) {
      return [{
        type: ETimelineType.VM,
        label: t('shiftEntry.vm'),
        startTime: checkInTime ?? shiftStartTime,
        endTime: checkOutTime ?? shiftEndTime,
        color: '#9734EE',
      }];
    }
    if ((isMissingCheckIn || isMissingCheckOut) && updatedTimeline.length > 0 && !isLeavePN) {
      return [{
        type: ETimelineType.FORGOT_TO_CLOCK_TIME,
        label: t('shiftEntry.forgotClockTime'),
        startTime: checkInTime ?? shiftStartTime,
        endTime: checkOutTime ?? shiftEndTime,
        color: '#F59E0B',
      }];
    }
    // ===== 5. Normalize time format =====
    return result
  };
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
            <ShiftTimeline timeline={convertTimeLine({ timeline, lateMinutes, earlyMinutes, checkInTime, checkOutTime, t }) ?? []} />
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
