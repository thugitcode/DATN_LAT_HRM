import { useState } from 'react';
import { StatusChipSelect } from '@/components/status-chip-select';
import { NAMESPACES } from '@/i18n/constants';
import { Button, Chip, Input, Select, SelectItem } from '@heroui/react';
import {
  IconCheck,
  IconChevronDown,
  IconClock,
  IconCopy,
  IconMapPin,
  IconUserCircle,
  IconVideo,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';
import { cn } from '@/lib/utils';
import { interviewScheduleService } from '@/services/recruitment-management/interview-schedule.service';
import { ModalType, useModal } from '@/store/useModal';

import { STATUS_INTERVIEW_SCHEDULE_ACTIONS } from '@/features/recruitment-management/constants/interview-schedule';
import { useInterviewScheduleDetail } from '@/hooks/queries/use-interview-schedule-query';
import { QUERY_KEY } from '@/hooks/use-crud-query';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { INTERVIEW_STATUS_CONFIG } from '../../recruitment-request-details/constants/data';
import { copyToClipboard } from '../../recruitment-request-details/helpers/helpers';
import {
  InterviewMethodEnum,
  InterviewStatusEnum,
  type InterviewSchedule,
} from '../../recruitment-request-details/types/interview.type';

interface InterviewDetailCardProps {
  interview: InterviewSchedule;
  onAction?: (action: string, interview: InterviewSchedule) => void;
}

export function InterviewDetailCard({ interview, onAction }: InterviewDetailCardProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();
  const openModal = useModal((s) => s.onOpen);
  const onOpen = useDrawer(s => s.onOpen)
  const { data: interviewDetail } = useInterviewScheduleDetail(interview.id)
  const isOnline = interview.interviewMethod === InterviewMethodEnum.ONLINE;

  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [locationValue, setLocationValue] = useState('');
  const [editingMethod, setEditingMethod] = useState<InterviewMethodEnum>(interview.interviewMethod);

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (status: InterviewStatusEnum) =>
      interviewScheduleService.patch(interview.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.INTERVIEW_SCHEDULE, 'list'] });
    },
  });
  const { mutate: updateMethod, isPending: isPendingMethod } = useMutation({
    mutationFn: (method: InterviewMethodEnum) =>
      interviewScheduleService.patch(interview.id, { interviewMethod: method }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.INTERVIEW_SCHEDULE, 'list'] });
    },
  });

  const { mutate: updateLocation, isPending: isPendingLocation } = useMutation({
    mutationFn: (value: string) =>
      interviewScheduleService.patch(
        interview.id,
        editingMethod === InterviewMethodEnum.ONLINE ? { onlineLink: value } : { roomName: value },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.INTERVIEW_SCHEDULE, 'list'] });
      setIsEditingLocation(false);
    },
  });

  const actions = STATUS_INTERVIEW_SCHEDULE_ACTIONS[interview.status];

  const handleAction = (action: string) => {
    if (action === 'cancel') {
      updateStatus(InterviewStatusEnum.CANCELLED);
    }
    if (action === 'reschedule') {
      onOpen(DrawerType.INTERVIEW_SCHEDULE_MUTATE, { interviewId: interview.id });
    }
    if (action === 'resend_mail') {
      openModal(ModalType.RESEND_MAIL, { id: interview.id });
      return;
    }
    if (action === 'postpone') {
      updateStatus(InterviewStatusEnum.POSTPONED);
    }
    if (action === 'resend') {
      updateStatus(InterviewStatusEnum.PENDING_CONFIRMATION);
    }
    if (action === 'evaluate') {
      onOpen(DrawerType.EVALUATION_MUTATE, { candidate: interviewDetail?.data?.candidate, candidateId: interviewDetail?.data?.candidate?.id });
    }
    if (action === 'create_new') {
      onOpen(DrawerType.INTERVIEW_SCHEDULE_MUTATE);
    }
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
        <StatusChipSelect
          value={interview.status}
          isPending={isPending}
          options={Object.values(InterviewStatusEnum).map((s) => ({
            key: s,
            label: t(`interview_schedule.status.${s}` as any),
            color: INTERVIEW_STATUS_CONFIG[s].color,
            bg: INTERVIEW_STATUS_CONFIG[s].bg,
          }))}
          onSelect={(key) => updateStatus(key as InterviewStatusEnum)}
        />
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
            {isEditingLocation ? (
              <div className="flex items-center gap-1 flex-1 min-w-0">
                <Input
                  size="sm"
                  value={locationValue}
                  onValueChange={setLocationValue}
                  classNames={{ inputWrapper: 'h-7 min-h-7 rounded-lg text-xs' }}
                  className="flex-1 min-w-0"
                />
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  className="shrink-0 min-w-6 w-6 h-6"
                  onPress={() => setIsEditingLocation(false)}
                >
                  <IconX size={14} />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="success"
                  className="shrink-0 min-w-6 w-6 h-6"
                  isLoading={isPendingLocation}
                  onPress={() => updateLocation(locationValue)}
                >
                  <IconCheck size={14} />
                </Button>
              </div>
            ) : (
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
                      className="cursor-pointer"
                    />
                  </span>
                ) : (
                  interview.roomName
                )}
              </span>
            )}
          </div>
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
            <StatusChipSelect
              value={interview.interviewMethod}
              isPending={isPendingMethod}
              options={Object.values(InterviewMethodEnum).map((s) => ({
                key: s,
                label: t(`interview_schedule.method.${s}` as any),
                color: "#000000",
                bg: "#F4F4F5",
              }))}
              onSelect={(key) => {
                const newMethod = key as InterviewMethodEnum;
                updateMethod(newMethod);
                setEditingMethod(newMethod);
                const defaultValue = newMethod === InterviewMethodEnum.ONLINE
                  ? (interview.onlineLink ?? '')
                  : (interview.roomName ?? '');
                setLocationValue(defaultValue);
                setIsEditingLocation(true);
              }}
              classNames={{
                trigger: 'bg-[#F4F4F5] text-sm px-[14px] py-2 w-28 flex justify-between text-black rounded-xl h-[38px]'
              }}
            />
          </div>
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
