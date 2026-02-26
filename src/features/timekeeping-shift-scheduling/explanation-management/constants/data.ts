import { AttendanceExplanationType } from "@/types/attendance-explanation.type";
import { IconAlertCircle, IconAlertTriangleFilled, IconBriefcase, IconDots, IconLogin, IconLogout, IconStethoscope, IconUserOff, type IconProps } from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

export const mockExplanationData: any[] = [
    {
        id: '1',
        departmentName: 'Khoa tai mũi họng',
        employeeCode: '23534546',
        employeeName: 'Pham Văn A',
        position: 'BA',
        date: '12/1/2026',
        errorType: 'Đi muộn',
        explanation: '7:30',
        attachmentName: 'Tên file.pdf',
        approverName: 'ALan Hanh',
        status: 'pending',
    },
    {
        id: '2',
        departmentName: 'Khoa tai mũi họng',
        employeeCode: '23534546',
        employeeName: 'Pham Văn A',
        position: 'BA',
        date: '12/1/2026',
        errorType: 'Đi muộn',
        explanation: '7:30',
        attachmentName: 'Tên file.pdf',
        approverName: 'ALan Hanh',
        status: 'pending',
    },
    {
        id: '3',
        departmentName: 'Khoa tai mũi họng',
        employeeCode: '23534546',
        employeeName: 'Pham Văn A',
        position: 'BA',
        date: '12/1/2026',
        errorType: 'Đi muộn',
        explanation: '7:30',
        attachmentName: 'Tên file.pdf',
        approverName: 'ALan Hanh',
        status: 'approved',
    },
    {
        id: '4',
        departmentName: 'Khoa tai mũi họng',
        employeeCode: '23534546',
        employeeName: 'Pham Văn A',
        position: 'BA',
        date: '12/1/2026',
        errorType: 'Đi muộn',
        explanation: '7:30',
        attachmentName: 'Tên file.pdf',
        approverName: 'ALan Hanh',
        status: 'approved',
    },
    {
        id: '5',
        departmentName: 'Khoa tai mũi họng',
        employeeCode: '23534546',
        employeeName: 'Pham Văn A',
        position: 'BA',
        date: '12/1/2026',
        errorType: 'Đi muộn',
        explanation: '7:30',
        attachmentName: 'Tên file.pdf',
        approverName: 'ALan Hanh',
        status: 'approved',
    },
    {
        id: '6',
        departmentName: 'Khoa tai mũi họng',
        employeeCode: '23534546',
        employeeName: 'Pham Văn A',
        position: 'BA',
        date: '12/1/2026',
        errorType: 'Đi muộn',
        explanation: '7:30',
        attachmentName: 'Tên file.pdf',
        approverName: 'ALan Hanh',
        status: 'approved',
    },
    {
        id: '7',
        departmentName: 'Khoa tai mũi họng',
        employeeCode: '23534546',
        employeeName: 'Pham Văn A',
        position: 'BA',
        date: '12/1/2026',
        errorType: 'Đi muộn',
        explanation: '7:30',
        attachmentName: 'Tên file.pdf',
        approverName: 'ALan Hanh',
        status: 'rejected',
    },
];

export const mockSummary: any = {
    totalRequests: 4,
    approved: 4,
    rejected: 4,
    pending: 4,
};

export const mockExplanationTypes: any[] = [
    { label: 'Nghỉ ốm', count: 4 },
    { label: 'Công tác', count: 12 },
    { label: 'Đi muộn', count: 24 },
];

export const statusOptions = [
    { key: 'ALL', label: 'Tất cả' },
    { key: 'PENDING', label: 'Chờ xác nhận' },
    { key: 'APPROVED', label: 'Đã xác nhận' },
    { key: 'REJECTED', label: 'Từ chối' },
];


export const attendanceExplanationUI: Record<
  AttendanceExplanationType,
  {
    label: string;
    className: string;
    icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  }
> = {
  [AttendanceExplanationType.LATE]: {
    label: "Đi muộn",
    className: "bg-danger-50 text-danger",
    icon: IconAlertTriangleFilled,
  },

  [AttendanceExplanationType.EARLY_LEAVE]: {
    label: "Về sớm",
    className: "bg-warning-100 text-warning-700",
    icon: IconLogout,
  },

  [AttendanceExplanationType.MISSING_CHECK_IN]: {
    label: "Thiếu check-in",
    className: "bg-danger-50 text-danger",
    icon: IconLogin,
  },

  [AttendanceExplanationType.MISSING_CHECK_OUT]: {
    label: "Thiếu check-out",
    className: "bg-danger-50 text-danger",
    icon: IconLogout,
  },

  [AttendanceExplanationType.ABSENT]: {
    label: "Vắng mặt",
    className: "bg-danger-100 text-danger-700",
    icon: IconUserOff,
  },

  [AttendanceExplanationType.MISSING_HOURS]: {
    label: "Thiếu giờ làm",
    className: "bg-warning-50 text-warning",
    icon: IconAlertCircle,
  },

  [AttendanceExplanationType.BUSINESS_TRIP]: {
    label: "Công tác",
    className: "bg-primary-50 text-primary",
    icon: IconBriefcase,
  },

  [AttendanceExplanationType.SICK]: {
    label: "Nghỉ ốm",
    className: "bg-secondary-50 text-secondary",
    icon: IconStethoscope,
  },

  [AttendanceExplanationType.OTHER]: {
    label: "Khác",
    className: "bg-default-100 text-default-700",
    icon: IconDots,
  },
};