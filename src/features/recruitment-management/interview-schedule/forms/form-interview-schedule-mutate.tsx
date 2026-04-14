import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';

import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { BtnCancel } from '@/components/btn-cancel';
import { BtnSave } from '@/components/btn-save';
import { FormSelect } from '@/components/form-fields/form-select';
import { FormInput } from '@/components/form-fields/form-input';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormArea } from '@/components/form-fields/form-area';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { candidateQueryOptions } from '@/services/query-options/recruitment-management/candidate.query';
import { InterviewMethodEnum } from '@/features/recruitment-management/recruitment-request-details/types/interview.type';

import { useFormInterviewSchedule } from '../hooks/use-form-interview-schedule';
import { useDirtyDrawer } from '@/hooks/use-dirty-drawer';
import { FormTimePicker } from '@/components/form-fields/form-time-picker';
import { EmailSection } from '../components/email-section';
import type { CandidateStatusEnum } from '../../recruitment-request-details/types/candidate.type';

interface DrawerData {
    candidateId?: string;
    interviewId?: string;
    candidateStatus?: CandidateStatusEnum;
}

const METHOD_KEYS = [
    { key: InterviewMethodEnum.ONLINE, labelKey: 'interview_schedule.method.ONLINE' },
    { key: InterviewMethodEnum.OFFLINE, labelKey: 'interview_schedule.method.OFFLINE' },
] as const;

export function FormInterviewScheduleMutate() {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const onClose = useDrawer((s) => s.onClose);
    const drawerData = useDrawer((s) => s.data) as DrawerData | undefined;
    const candidateId = drawerData?.candidateId;
    const candidateStatus = drawerData?.candidateStatus;
    const interviewId = drawerData?.interviewId;

    const { methods, isSubmitting, onSubmit, onSubmitAndSendMail } = useFormInterviewSchedule({
        candidateStatus,
        interviewId,
        candidateId,
        onSuccess: onClose,
        onSuccessAndSendMail: onClose,
    });
    useDirtyDrawer(methods.formState.isDirty);

    const { control, watch } = methods;
    const interviewMethod = watch('interviewMethod');

    const { options: staffOptions } = useStaffOptions();

    const { data: candidatesData } = useQuery(candidateQueryOptions.getAll());
    const candidateOptions =
        candidatesData?.data?.map((c) => ({ key: c.id, label: c.name })) ?? [];

    const methodOptions = METHOD_KEYS.map((m) => ({ key: m.key, label: t(m.labelKey) }));

    return (
        <div className="relative h-full overflow-hidden bg-[#FAFAFA]">
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-[#F4F4F5]">
                <h2 className="text-2xl font-bold text-[#11181C]">
                    {t('interview_schedule.form.title')}
                </h2>
            </div>

            <FormProvider {...methods}>
                <div className="flex flex-col gap-4 overflow-y-auto p-6 h-[calc(100vh-145px)]">
                    {/* General info section */}
                    <div className="bg-white rounded-2xl p-5 flex flex-col gap-5">
                        <p className="text-sm font-semibold text-[#11181C]">
                            {t('interview_schedule.form.sections.general_info')}
                        </p>

                        {/* Row 1: candidate + interviewer */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect
                                control={control}
                                name="candidateId"
                                label={t('interview_schedule.form.fields.candidate')}
                                isRequired
                                options={candidateOptions}
                                placeholder={t('interview_schedule.form.placeholders.select')}
                                isDisabled={!!candidateId}
                            />
                            <FormSelect
                                control={control}
                                name="interviewerId"
                                label={t('interview_schedule.form.fields.interviewer')}
                                isRequired
                                options={staffOptions.map((s) => ({ key: s.key, label: s.label }))}
                                placeholder={t('interview_schedule.form.placeholders.select')}
                            />
                        </div>

                        {/* Content */}
                        <FormInput
                            control={control}
                            name="content"
                            label={t('interview_schedule.form.fields.content')}
                            isRequired
                            placeholder={t('interview_schedule.form.placeholders.enter')}
                        />

                        {/* Interview method */}
                        <FormSelect
                            control={control}
                            name="interviewMethod"
                            label={t('interview_schedule.form.fields.method')}
                            isRequired
                            options={methodOptions}
                            placeholder={t('interview_schedule.form.placeholders.select')}
                        />

                        {/* Online link - shown only when method is ONLINE */}
                        {interviewMethod === InterviewMethodEnum.ONLINE && (
                            <FormInput
                                control={control}
                                name="onlineLink"
                                label={t('interview_schedule.form.fields.online_link')}
                                placeholder="meet.google.com/..."
                            />
                        )}

                        {/* Address - shown only when method is OFFLINE */}
                        {interviewMethod === InterviewMethodEnum.OFFLINE && (
                            <FormInput
                                control={control}
                                name="address"
                                label={t('interview_schedule.form.fields.address')}
                                placeholder={t('interview_schedule.form.placeholders.enter')}
                            />
                        )}

                        {/* Date + time row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormDatePicker
                                control={control}
                                name="interviewDate"
                                label={t('interview_schedule.form.fields.date')}
                                isRequired
                            />
                            <div className="flex flex-col gap-1">
                                <span className="text-base font-normal leading-5 text-[#52525B]">
                                    {t('interview_schedule.form.fields.time')} <span className="text-danger">*</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className='w-full'>
                                        <FormTimePicker
                                            control={control}
                                            name="startTime"
                                        />
                                    </div>
                                    <div className='w-full'>
                                        <FormTimePicker
                                            control={control}
                                            name="endTime"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Note */}
                        <FormArea
                            control={control}
                            name="note"
                            label={t('interview_schedule.form.fields.note')}
                            placeholder={t('interview_schedule.form.placeholders.enter')}
                            minRows={3}
                        />
                    </div>

                    {/* Message section */}
                    <EmailSection control={control} />
                </div>
            </FormProvider>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 w-full bg-white border-t border-[#F4F4F5] px-6 py-4 flex justify-end gap-2 z-10">
                <BtnCancel isDisabled={isSubmitting} onPress={onClose} className="border-1" />
                <BtnSave isLoading={isSubmitting} onPress={() => onSubmit()}>
                    {t('interview_schedule.form.btn_save')}
                </BtnSave>
                <Button
                    color="primary"
                    className="font-medium rounded-xl"
                    isLoading={isSubmitting}
                    onPress={() => onSubmitAndSendMail()}
                >
                    {t('interview_schedule.form.btn_save_and_send_mail')}
                </Button>
            </div>
        </div>
    );
}
