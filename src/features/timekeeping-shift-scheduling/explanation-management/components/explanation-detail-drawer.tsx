import {
    attendanceExplanationDetailQueryOptions,
    useApproveAttendanceExplanation,
    useManagerApproveAttendanceExplanation,
    useRejectAttendanceExplanation,
    useUpdateAttendanceExplanation,
} from '@/hooks/use-attendance-explanation';
import { useDrawer } from '@/store/useDrawer';
import { RequestStatusEnum } from '@/types/attendance-explanation.type';
import { addToast, Button, Spinner, Textarea } from '@heroui/react';
import { IconAlertCircle, IconCheck, IconFileText, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StaffAvatar } from '../../components/staff-avatar';
import { BtnCancel } from '@/components/btn-cancel';

export const ExplanationDetailDrawer: FC = () => {
    const { t } = useTranslation('explanation-management');
    const { data: drawerData, onClose } = useDrawer((state) => state);
    const explanationId = (drawerData as { id: string })?.id;
    const [openRejectModal, setOpenRejectModal] = useState<boolean>(true)
    const { data, isLoading } = useQuery({
        ...attendanceExplanationDetailQueryOptions(explanationId),
        enabled: !!explanationId,
    });
    const { mutateAsync: approveMutation, isPending: isApproving } = useApproveAttendanceExplanation();
    const { mutateAsync: update, isPending: isUpdate } = useUpdateAttendanceExplanation();
    const { mutateAsync: managerApproveMutation, isPending: isManagerApproving } = useManagerApproveAttendanceExplanation();
    const { mutateAsync: rejectMutation, isPending: isRejecting } = useRejectAttendanceExplanation();

    const [hrCommentInput, setHrCommentInput] = useState('');
    const [managerConfirmationInput, setManagerConfirmationInput] = useState('');

    useEffect(() => {
        if (data?.hrComment) {
            setHrCommentInput(data.hrComment);
        }
        if (data?.managerConfirmation) {
            setManagerConfirmationInput(data.managerConfirmation);
        }
    }, [data?.hrComment, data?.managerConfirmation]);

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center p-6">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500">
                <p>{t('explanation_detail.data_not_found')}</p>
                <Button variant="flat" onPress={onClose}>{t('explanation_detail.close')}</Button>
            </div>
        );
    }

    const {
        staffName,
        staffCode,
        roomName,
        departmentName,
        staffAvatar,
        shiftName,
        dateLabel,
        typeLabel,
        actualCheckIn,
        actualCheckOut,
        totalActualWorkingHours,
        reason,
        attachments,
        managerConfirmation,
        managerName,
        hrComment,
        status,
    } = data;

    const handleApprove = async () => {
        try {
            //thay đổi theo BE ngày 3/10

            // if (status === 'PENDING') {
            //     await managerApproveMutation({ id: explanationId, managerConfirmation: managerConfirmationInput });
            // } else if (status === 'PENDING_HR') {
            //     await approveMutation({ id: explanationId, hrComment: hrCommentInput });
            // } else {
            await update({
                id: explanationId,
                status: RequestStatusEnum.APPROVED,
                managerConfirmation: managerConfirmationInput,
                hrComment: hrCommentInput
            }, {
                onSuccess() {
                    addToast({ description: t('explanation_detail.approve_success'), color: "success" })
                },
            });
            // }
            onClose();
        } catch (error) {
            console.error('Lỗi khi phê duyệt:', error);
        }
    };

    const handleReject = async () => {
        try {
            // if (status === 'PENDING') {
            //     await rejectMutation({ id: explanationId, reason: 'Từ chối giải trình' });
            // } else {
            await update({
                id: explanationId,
                status: RequestStatusEnum.HR_REJECTED,
                managerConfirmation: managerConfirmationInput,
                hrComment: hrCommentInput
            }, {
                onSuccess() {
                    addToast({ description: t('explanation_detail.reject_success'), color: "success" })
                },
            });
            // }
            onClose();
        } catch (error) {
            console.error('Lỗi khi từ chối:', error);
        }
    };

    const formatTime = (time: string | undefined) => {
        if (!time) return '--:--';
        return time.substring(0, 5);
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

                {/* Staff and Shift Info Card */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Top part: Dark blue */}
                    <div className="bg-[#0A1A2F] px-4 py-3 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <StaffAvatar avatarUrl={staffAvatar} name={staffName} />
                            <div>
                                <div className="font-semibold text-[15px]">{staffName}</div>
                                <div className="text-xs text-slate-300 font-light mt-0.5">{t('explanation_detail.staff_code')}: {staffCode}</div>
                            </div>
                        </div>
                        <div className="text-xs text-slate-300">{departmentName || roomName}</div>
                    </div>

                    {/* Bottom part: Shift and Times */}
                    <div className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900">{shiftName || t('explanation_detail.shift')}</h4>
                                <div className="text-[13px] text-gray-500 mt-0.5">
                                    {formatTime(data.shiftStartTime)} - {formatTime(data.shiftEndTime)}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-gray-800">{dateLabel}</span>
                                <div className="bg-danger-50 text-danger text-[11px] font-semibold px-2 py-1 flex items-center gap-1 rounded-full">
                                    <IconAlertCircle size={14} />
                                    {typeLabel}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 divide-x divide-gray-100 text-center border-t border-dashed border-gray-200 pt-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-400">{t('explanation_detail.check_in')}</span>
                                <span className="text-[22px] font-medium text-danger">
                                    {formatTime(actualCheckIn)}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-400">{t('explanation_detail.check_out')}</span>
                                <span className="text-[22px] font-medium text-gray-900">
                                    {formatTime(actualCheckOut)}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-400">{t('explanation_detail.total_working_hours')}</span>
                                <span className="text-[22px] font-medium text-gray-900">
                                    {totalActualWorkingHours ? totalActualWorkingHours : formatTime(data.totalWorkHours)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Explanations Form */}
                <div className="bg-white rounded-xl p-5 space-y-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-2 block">{t('explanation_detail.reason')}</label>
                        <div className="bg-[#F4F4F5] text-sm text-gray-800 p-3 rounded-lg min-h-[44px]">
                            {reason || t('explanation_detail.no_reason')}
                        </div>
                    </div>

                    {attachments && attachments.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-2 block">{t('explanation_detail.attachments')}</label>
                            <div className="flex flex-col gap-2">
                                {attachments.map((file) => (
                                    <div key={file.id} className="flex flex-col">
                                        <a href={file.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary text-sm font-medium hover:underline">
                                            <IconFileText size={16} />
                                            <span>{file.fileName}</span>
                                        </a>
                                        {file.fileSize > 0 && (
                                            <span className="text-xs text-gray-400 ml-5">
                                                {(file.fileSize / 1024).toFixed(2)}KB
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-2 block">{t('explanation_detail.manager')}</label>
                        <div className="bg-[#F4F4F5] text-sm text-gray-800 p-3 rounded-lg">
                            {managerName || data.approvedByManagerName || '-'}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-2 block">{t('explanation_detail.manager_confirmation')}</label>
                        <Textarea
                            minRows={3}
                            disabled
                            placeholder={t('explanation_detail.manager_confirmation_placeholder')}
                            value={managerConfirmationInput}
                            onValueChange={setManagerConfirmationInput}
                            classNames={{ inputWrapper: 'bg-[#F4F4F5] border-none shadow-none', input: 'placeholder:text-gray-400' }}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-2 block">{t('explanation_detail.hr_confirmation')}</label>
                        <Textarea
                            disabled={![RequestStatusEnum.MANAGER_APPROVED, RequestStatusEnum.APPROVED, RequestStatusEnum.HR_REJECTED].includes(status)}
                            minRows={3}
                            placeholder={t('explanation_detail.hr_confirmation_placeholder')}
                            value={hrCommentInput}
                            onValueChange={setHrCommentInput}
                            classNames={{ inputWrapper: 'bg-[#F4F4F5] border-none shadow-none', input: 'placeholder:text-gray-400' }}
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}

            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3 mt-auto">
                {![RequestStatusEnum.MANAGER_APPROVED, RequestStatusEnum.APPROVED, RequestStatusEnum.HR_REJECTED].includes(status) ? <BtnCancel onPress={onClose} /> : <><Button
                    variant="bordered"
                    color="danger"
                    // onPress={() => (status === 'PENDING' || status === 'PENDING_HR') ? handleReject() : setOpenRejectModal(true)}
                    onPress={() => handleReject()}
                    isLoading={isRejecting}
                    isDisabled={isApproving || isManagerApproving}
                    className="font-medium bg-white"
                    startContent={!isRejecting && <IconX size={16} />}
                >
                    {t('explanation_detail.reject')}
                </Button>
                    <Button
                        color="primary"
                        onPress={handleApprove}
                        isLoading={isApproving || isManagerApproving}
                        isDisabled={isRejecting}
                        className="font-medium"
                        startContent={!isApproving && <IconCheck size={16} />}
                    >
                        {t('explanation_detail.confirm')}
                    </Button>
                </>}
            </div>
            {/* <ConfirmModal
                isOpen={openRejectModal}
                config={ CONFIRM_CONFIG["reject"]}
                isLoading={isApproving || isRejecting}
                reason={reason}
                onReasonChange={setReason}
                onConfirm={handleConfirm}
                onClose={handleClose}
            /> */}
        </div>
    );
};
