import { NAMESPACES } from '@/i18n/constants';
import { Button, Chip, Select, SelectItem } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IconChevronDown,
  IconClock,
  IconCopy,
  IconMail,
  IconMapPin,
  IconUserCircle,
  IconVideo
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';
import { cn } from '@/lib/utils';
import { interviewScheduleService } from '@/services/recruitment-management/interview-schedule.service';
import { interviewScheduleKeys } from '@/services/query-options/recruitment-management/interview-schedule.query';

import { STATUS_CONFIG } from '../constants/data';
import { copyToClipboard } from '../helpers/helpers';
import {
  InterviewMethodEnum,
  InterviewStatusEnum,
  type InterviewSchedule,
} from '../types/interview.type';

interface ActionDef {
  key: string;
  color?: 'primary' | 'danger' | 'default';
  variant?: 'solid' | 'bordered';
  icon?: React.ReactNode;
}

interface ActionConfig {
  primary: ActionDef;
  secondary?: ActionDef[];
}

const STATUS_ACTIONS: Partial<Record<InterviewStatusEnum, ActionConfig>> = {
  [InterviewStatusEnum.PENDING_CONFIRMATION]: {
    secondary: [
      { key: 'cancel', color: 'danger', variant: 'bordered' },
      { key: 'reschedule', color: 'primary', variant: 'bordered' },
    ],
    primary: {
      key: 'resend_mail',
      color: 'primary',
      variant: 'solid',
      icon: <IconMail size={15} />,
    },
  },
  [InterviewStatusEnum.CONFIRMED]: {
    secondary: [
      { key: 'cancel', color: 'danger', variant: 'bordered' },
      { key: 'reschedule', color: 'primary', variant: 'bordered' },
    ],
    primary: { key: 'postpone', color: 'primary', variant: 'solid' },
  },
  [InterviewStatusEnum.PENDING_EVALUATION]: {
    primary: { key: 'evaluate', color: 'primary', variant: 'solid' },
  },
  [InterviewStatusEnum.POSTPONED]: {
    secondary: [
      { key: 'cancel', color: 'danger', variant: 'bordered' },
      { key: 'resend', color: 'primary', variant: 'bordered' },
    ],
    primary: { key: 'create_new', color: 'primary', variant: 'solid' },
  },
  [InterviewStatusEnum.CANCELLED]: {
    primary: { key: 'create_new', color: 'primary', variant: 'solid' },
  },
};

interface InterviewDetailCardProps {
  interview: InterviewSchedule;
  onAction?: (action: string, interview: InterviewSchedule) => void;
}

export function InterviewDetailCard({ interview, onAction }: InterviewDetailCardProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();

  const config = STATUS_CONFIG[interview.status];
  const actions = STATUS_ACTIONS[interview.status];
  const isOnline = interview.interviewMethod === InterviewMethodEnum.ONLINE;

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (status: InterviewStatusEnum) =>
      interviewScheduleService.patch(interview.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: interviewScheduleKeys.lists() });
    },
  });

  const handleAction = (action: string) => {
    onAction?.(action, interview);
  };

  return (
    <div className="w-full flex flex-col">
      {/* Header */}
      <div
        className={cn('flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#E4E4E7]')}
      >
        <span className="text-xl leading-7 font-medium text-[#11181C] truncate flex-1 mr-2">
          {t('interview_schedule.label.interview')}: {interview.position}
        </span>
        <Select
          size="lg"
          color={config.chipColor}
          variant="flat"
          isDisabled={isPending}
          selectedKeys={[interview.status]}
          onSelectionChange={(keys) => {
            const status = Array.from(keys)[0] as InterviewStatusEnum;
            if (status && status !== interview.status) updateStatus(status);
          }}
          aria-label="Change interview status"
          className="shrink-0 w-35 min-w-[120px]"
          classNames={{
            trigger: 'h-7 min-h-7 rounded-full px-2 border-none shadow-none',
            value: 'text-xs font-medium',
            selectorIcon: 'text-current'
          }}
        // disabledKeys={[interview.status]}
        >
          {Object.values(InterviewStatusEnum).map((status) => (
            <SelectItem key={status}>
              {t(`interview_schedule.status.${status}` as any)}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Body */}
      <div className="px-4 py-3 flex flex-col gap-3">
        {/* Candidate & Interviewer */}
        <div className="flex items-center justify-start gap-6">
          <div className="flex items-center gap-2">
            <IconUserCircle className="size-5 stroke-[1.5]" />
            <div>
              <p className="text-[10px] text-[#71717A]">
                {t('interview_schedule.detail.candidate')}
              </p>
              <p className="text-xs font-medium text-[#11181C]">{interview.candidateName}</p>
            </div>
          </div>
          <hr className="w-px h-8 bg-[#E4E4E7]" />
          <div className="flex items-center gap-2">
            <StaffAvatar
              avatarUrl={interview.interviewerAvatar ?? ''}
              name={interview.interviewerName}
            />
            <div className="text-left">
              <p className="text-[10px] text-[#71717A]">
                {t('interview_schedule.detail.interviewer')}
              </p>
              <p className="text-xs font-medium text-[#11181C]">{interview.interviewerName}</p>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {interview.interviewMethod === InterviewMethodEnum.OFFLINE ? (
              <IconMapPin size={20} stroke={1.5} color="black" className="shrink-0" />
            ) : (
              <IconVideo size={20} stroke={1.5} color="black" className="shrink-0" />
            )}
            <span className="text-xs text-[#11181C] truncate">
              {isOnline ? (
                <span className="flex gap-2">
                  <a
                    href={interview.onlineLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {interview.onlineLink || 'Online'}
                  </a>
                  <IconCopy
                    color="#6576FF"
                    size={20}
                    onClick={() => copyToClipboard(interview.onlineLink)}
                  />
                </span>
              ) : (
                interview.roomName
              )}
            </span>
          </div>
          <Chip
            size="sm"
            variant="flat"
            color="default"
            endContent={<IconChevronDown size={11} />}
            className="shrink-0 cursor-default"
          >
            {t(`interview_schedule.method.${interview.interviewMethod}`)}
          </Chip>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2">
          <IconClock size={20} stroke={1.5} color="black" className="shrink-0" />
          <div>
            <p className="text-xs text-[#11181C]">
              {interview.startTime} → {interview.endTime}
            </p>
            <p className="text-[10px] text-[#71717A]">
              {dayjs(interview.interviewDate).format('D/M/YYYY')}
            </p>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      {actions && (
        <div className="px-4 pb-4 pt-2 border-t border-[#E4E4E7] flex justify-end gap-2">
          {actions.secondary?.map((action) => (
            <Button
              key={action.key}
              color={action.color}
              variant={action.variant}
              className="rounded-xl font-medium border-1 text-xs"
              onPress={() => handleAction(action.key)}
            >
              {t(`interview_schedule.actions.${action.key}` as any)}
            </Button>
          ))}
          <Button
            color={actions.primary.color}
            variant={actions.primary.variant}
            className="rounded-xl font-medium border-1 text-xs"
            startContent={actions.primary.icon}
            onPress={() => handleAction(actions.primary.key)}
          >
            {t(`interview_schedule.actions.${actions.primary.key}` as any)}
          </Button>
        </div>
      )}
    </div>
  );
}
