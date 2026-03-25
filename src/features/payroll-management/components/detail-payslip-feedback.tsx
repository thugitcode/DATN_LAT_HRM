import { useDrawer } from '@/store/useDrawer';
import { Button } from '@heroui/react';

import { formatVND } from '@/lib/helpers';
import { StaffAvatar } from '@/features/timekeeping-shift-scheduling/components/staff-avatar';

import type { PayslipFeedback } from '../types/payslip-feedback.type';

const StatusLabel: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  RESOLVED: 'Đã xử lý',
  REJECTED: 'Từ chối',
};

const JobTitleLabel: Record<string, string> = {
  DOCTOR: 'Bác sĩ',
  NURSE: 'Y tá',
  PHARMACIST: 'Dược sĩ',
  TECHNICIAN: 'Kỹ thuật viên',
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const d = new Date(value);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
};

const calcGross = (payrollResult: PayslipFeedback['payrollResult']) => {
  if (!payrollResult) return 0;
  return (
    Number(payrollResult.basicSalary) +
    Number(payrollResult.allowanceAmount) +
    Number(payrollResult.overtimeAmount) +
    Number(payrollResult.bonusAmount)
  );
};

const Row = ({ label, value, bold }: { label: string; value: string; bold?: boolean }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <span className={`text-sm ${bold ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
      {label}
    </span>
    <span className={`text-sm ${bold ? 'font-semibold text-gray-800' : 'text-gray-800'}`}>
      {value}
    </span>
  </div>
);

export const DetailPayslipFeedback = () => {
  const { data, onClose } = useDrawer((state) => state);

  const dataRow = data as PayslipFeedback | undefined;

  if (!dataRow) return null;

  const { staff, payrollResult, status, resolvedAt } = dataRow;
  const period = payrollResult?.payrollPeriod;
  const details = payrollResult?.calculationDetails;

  const isResolved = status === 'RESOLVED';
  const staffSubtitle = [
    staff?.code,
    staff?.jobTitle ? (JobTitleLabel[staff.jobTitle] ?? staff.jobTitle) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className="flex flex-col justify-between pb-6 h-full bg-white">
      <div className="px-6">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h2 className="text-xl font-bold text-gray-900">Phiếu lương</h2>
          <div className="flex items-center gap-3">
            {resolvedAt && <span className="text-xs text-gray-400">{formatDate(resolvedAt)}</span>}
            <span
              className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                isResolved ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isResolved ? 'bg-green-500' : 'bg-yellow-500'
                }`}
              />
              {StatusLabel[status] ?? status}
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
            <p className="text-white text-base font-semibold uppercase tracking-wide text-right">
              Phiếu lương {period.name.toUpperCase()}
            </p>
          )}
        </div>

        <div className="flex-1 rounded-b-xl border border-[#11111126] overflow-y-auto px-4 pb-4">
          <div className="mb-4">
            <Row label="Từ ngày" value={formatDate(period?.fromDate)} bold />
            <Row label="Đến ngày" value={formatDate(period?.toDate)} bold />
            <Row
              label="Công chuẩn"
              value={details?.standardDays != null ? `${details.standardDays} ngày` : '—'}
              bold
            />
            <Row
              label="Công thực tế"
              value={details?.actualWorkDays != null ? `${details.actualWorkDays} ngày` : '—'}
              bold
            />
            <Row label="Công trực" value="—" bold />
            <Row
              label="Làm thêm"
              value={details?.overtimeHours != null ? `${details.overtimeHours} giờ` : '—'}
              bold
            />
            <Row label="Công tác" value="—" bold />
          </div>

          <div className="border-t border-dashed border-gray-200 my-2" />

          <div className="">
            <Row label="Tổng Gross" value={formatVND(calcGross(payrollResult))} bold />
            <Row
              label="BH NV đóng"
              value={formatVND(Number(payrollResult?.insuranceAmount))}
              bold
            />
            <Row label="Thuế TNCN" value={formatVND(Number(payrollResult?.taxAmount))} bold />
            <Row label="Tạm ứng (Nếu có)" value="—" />
          </div>

          <div className="border-t border-dashed border-gray-200 my-6" />

          <div className="mt-2 rounded-xl bg-blue-50 px-4 py-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-blue-500 text-base">🔒</span>
              <span className="text-sm font-semibold text-gray-800">Tổng thực nhận:</span>
            </div>
            <span className="text-base font-bold text-blue-600">
              {formatVND(Number(payrollResult?.netPay))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end px-6">
        <Button
          variant="light"
          size="sm"
          onPress={onClose}
          className="border-[#006FEE] border bg-white text-[#006FEE] text-[14px] font-normal"
        >
          Thoát
        </Button>
      </div>
    </div>
  );
};
