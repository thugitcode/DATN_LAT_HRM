import { useState } from 'react';
import { useDrawer } from '@/store/useDrawer';
import { Button, Textarea, addToast } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { formatVND } from '@/lib/helpers';
import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';
import { hrmInstance } from '@/lib/axios';

import type { PayslipFeedback } from '../types/payslip-feedback.type';
import { icons } from '@/lib/icons';

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const calcGross = (payroll: PayslipFeedback['payroll']) => {
  if (!payroll) return 0;
  return (
    Number(payroll.basicSalary) +
    Number(payroll.allowanceAmount) +
    Number(payroll.overtimeAmount) +
    Number(payroll.bonusAmount)
  );
};

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className="flex items-center justify-between py-1">
    <span className={`text-sm text-gray-600`}>
      {label}
    </span>
    <span className={`text-base leading-6 ${bold ? 'font-medium text-gray-800' : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

export const DetailPayslipFeedback = () => {
  const { data, onClose } = useDrawer((state) => state);
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const { t: tCommon } = useTranslation(NAMESPACES.COMMON);

  const [responseContent, setResponseContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  const dataRow = data as PayslipFeedback | undefined;

  if (!dataRow) return null;

  const { staff, payroll, status, resolvedAt, period } = dataRow;

  const details = payroll?.calculationDetails;

  // status='CONFIRMED' khớp đúng với PayslipFeedbackStatus enum (PENDING|CONFIRMED|REJECTED)
  const isResolved = status === 'CONFIRMED';
  const staffSubtitle = [
    staff?.code,
    staff?.jobTitle?.name ?? null,
  ]
    .filter(Boolean)
    .join(' · ');

  const handleSendResponse = async () => {
    if (!responseContent.trim()) {
      addToast({ description: 'Vui lòng nhập nội dung trả lời', color: 'warning' });
      return;
    }
    setIsSending(true);
    try {
      await hrmInstance.patch(`/payroll/feedback/${dataRow.id}/respond`, { responseContent });
      addToast({ description: 'Đã gửi trả lời cho nhân viên', color: 'success' });
      onClose();
    } catch {
      addToast({ description: 'Gửi trả lời thất bại', color: 'danger' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col justify-between pb-5 h-full gap-3 bg-white overflow-hidden">
      <div className="px-6">
        <div className="flex items-center justify-between pb-3 pt-4">
          <h2 className="text-xl font-bold text-gray-900">{t('payslipFeedback.detail.title')}</h2>
          <div className="flex items-center gap-3">
            {resolvedAt && <span className="text-xs text-gray-400">{formatDate(resolvedAt)}</span>}
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${isResolved ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
              />
              {t(`payslipFeedback.detail.status.${status}`, { defaultValue: status })}
            </span>
          </div>
        </div>

        <div className="rounded-t-xl bg-blue-600 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <StaffAvatar avatarUrl={staff?.avatar} name={staff?.name} />
            <div>
              <p className="text-white text-sm font-semibold leading-tight">{staff?.name ?? '—'}</p>
              <p className="text-blue-100 text-xs mt-0.5">{staffSubtitle}</p>
            </div>
          </div>
          {period?.name && (
            <p className="text-white text-xl font-medium uppercase tracking-wide text-right">
              {t('payslipFeedback.detail.payslip_period', { period: period.name.toUpperCase() })}
            </p>
          )}
        </div>

        <div className="flex-1 rounded-b-xl border border-[#11111126] overflow-y-auto px-6 py-3 overflow-auto h-[calc(100vh-185px)]">
          <div className="mb-4 flex flex-col gap-2">
            <Row label={t('payslipFeedback.detail.from_date')} value={formatDate(period?.fromDate)} bold />
            <Row label={t('payslipFeedback.detail.to_date')} value={formatDate(period?.toDate)} bold />
            <Row
              label={t('payslipFeedback.detail.standard_days')}
              value={payroll?.workDays != null ? `${payroll.workDays} ${t('payslipFeedback.detail.unit_day')}` : '—'}
              bold
            />
            <Row
              label={t('payslipFeedback.detail.actual_work_days')}
              value={payroll?.totalAttendance != null ? `${payroll.totalAttendance} ${t('payslipFeedback.detail.unit_day')}` : '—'}
              bold
            />
            <Row label={t('payslipFeedback.detail.on_duty')} value={payroll?.onCallDays != null ? `${payroll.onCallDays} ${t('payslipFeedback.detail.unit_hour')}` : '—'} bold />
            <Row
              label={t('payslipFeedback.detail.overtime_hours')}
              value={payroll?.overtimeHours != null ? `${payroll.overtimeHours} ${t('payslipFeedback.detail.unit_hour')}` : '—'}
              bold
            />
            <Row label={t('payslipFeedback.detail.business_trip')} value={payroll?.businessTripDays != null ? `${payroll.businessTripDays} ${t('payslipFeedback.detail.unit_day')}` : '—'} bold />
          </div>

          <div className="border-t border-dashed border-gray-200 my-2" />

          <div className="">
            <Row label={t('payslipFeedback.detail.total_gross')} value={formatVND(payroll?.totalGross ?? 0)} bold />
            <Row
              label={t('payslipFeedback.detail.insurance')}
              value={formatVND(Number(payroll?.insuranceAmount ?? 0))}
              bold
            />
            <Row label={t('payslipFeedback.detail.tax')} value={formatVND(Number(payroll?.taxAmount ?? 0))} bold />
            <Row label={t('payslipFeedback.detail.advance')} value={formatVND(Number(payroll?.advancePayment ?? 0))} bold />
          </div>

          <div className="border-t border-dashed border-gray-200 my-6" />

          <div className="rounded-xl bg-blue-50 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#6576FF]">
              {icons.moneyBag}
              <span className="text-[#6576FF] font-medium text-lg leading-7">{t('payslipFeedback.detail.net_pay')}</span>
            </div>
            <span className="text-2xl font-medium leading-8 text-blue-600">
              {formatVND(Number(payroll?.netPay ?? 0))}
            </span>
          </div>

          <div className="border-t border-dashed border-gray-200 my-6" />

          <div className='border border-[#11111126] rounded-xl'>
            <div className='bg-[#F4F4F5] rounded-t-xl p-3'>
              {t("payslipFeedback.detail.history")}
            </div>
            <div className='p-3 gap-2 flex flex-col'>
              <div className='flex items-center gap-2'>
                <StaffAvatar avatarUrl={staff.avatar} name={staff.name} />
                <span className='text-sm leading-5'>{staff.name}</span>
              </div>
              <div className='bg-[#F4F4F5] rounded-xl p-3 text-xs leading-4'>
                {dataRow.content}
              </div>
            </div>
          </div>

          {/* Trả lời của HR — trước đây không có ô nào, chỉ xem không trả lời được */}
          <div className="border border-[#11111126] rounded-xl mt-4">
            <div className="bg-[#F4F4F5] rounded-t-xl p-3 font-medium">
              Trả lời của HR
            </div>
            <div className="p-3 flex flex-col gap-3">
              {dataRow.responseContent ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-800">
                  {dataRow.responseContent}
                </div>
              ) : (
                <>
                  <Textarea
                    value={responseContent}
                    onValueChange={setResponseContent}
                    placeholder="Nhập nội dung trả lời cho nhân viên..."
                    minRows={3}
                  />
                  <Button
                    color="primary"
                    onPress={handleSendResponse}
                    isLoading={isSending}
                    isDisabled={!responseContent.trim()}
                    className="self-end"
                  >
                    Gửi trả lời
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end px-6">
        <Button
          variant="light"
          size="sm"
          onPress={onClose}
          className="border-[#6576FF] border bg-white text-[#6576FF] text-[14px] font-normal"
        >
          {t('payslipFeedback.detail.close')}
        </Button>
      </div>
    </div>
  );
};