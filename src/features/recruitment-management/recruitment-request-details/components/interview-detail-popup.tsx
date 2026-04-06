import { Modal, ModalBody, ModalContent, ModalHeader, Chip, Divider } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { NAMESPACES } from '@/i18n/constants';
import { type InterviewSchedule } from '../types/interview.type';
import { STATUS_CONFIG } from '../constants/data';

interface InterviewDetailPopupProps {
  interview: InterviewSchedule | null;
  onClose: () => void;
}

interface FieldRowProps {
  label: string;
  value?: string | null;
}

function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-[#71717A]">{label}</span>
      <span className="text-sm font-medium text-[#11181C]">{value ?? '—'}</span>
    </div>
  );
}

export function InterviewDetailPopup({ interview, onClose }: InterviewDetailPopupProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  if (!interview) return null;

  const config = STATUS_CONFIG[interview.status];

  return (
    <Modal isOpen={!!interview} onClose={onClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-3 pb-2">
          <span className="text-lg font-semibold text-[#11181C]">{interview.candidateName}</span>
          <Chip size="sm" color={config.chipColor} variant="flat">
            {t(`interview_schedule.status.${interview.status}` as any)}
          </Chip>
        </ModalHeader>

        <ModalBody className="pb-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldRow label={t('interview_schedule.detail.code')} value={interview.code} />
            <FieldRow
              label={t('interview_schedule.detail.method')}
              value={t(`interview_schedule.method.${interview.interviewMethod}` as any)}
            />
          </div>

          <Divider />

          <div className="grid grid-cols-2 gap-4">
            <FieldRow
              label={t('interview_schedule.detail.date')}
              value={dayjs(interview.interviewDate).format('DD/MM/YYYY')}
            />
            <FieldRow
              label={t('interview_schedule.detail.time')}
              value={`${interview.startTime} - ${interview.endTime}`}
            />
          </div>

          <Divider />

          <div className="grid grid-cols-2 gap-4">
            <FieldRow label={t('interview_schedule.detail.position')} value={interview.position} />
            <FieldRow label={t('interview_schedule.detail.department')} value={interview.departmentName} />
            <FieldRow label={t('interview_schedule.detail.room')} value={interview.roomName} />
            <FieldRow label={t('interview_schedule.detail.interviewer')} value={interview.interviewerName} />
          </div>

          {interview.content && (
            <>
              <Divider />
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-[#71717A]">{t('interview_schedule.detail.content')}</span>
                <p className="text-sm text-[#11181C] whitespace-pre-wrap">{interview.content}</p>
              </div>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
