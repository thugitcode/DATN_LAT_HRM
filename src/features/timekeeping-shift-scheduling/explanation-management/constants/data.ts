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
    className: string; // giờ dùng hex + Tailwind opacity nếu cần
    icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  }
> = {
  [AttendanceExplanationType.LATE]: {
    label: "Đi muộn",
    className: "bg-[#D55829]/10 text-[#D55829]", // nhạt + đậm như legend
    icon: IconAlertTriangleFilled,
  },

  [AttendanceExplanationType.EARLY_LEAVE]: {
    label: "Về sớm",
    className: "bg-[#73C9C6]/10 text-[#73C9C6]",
    icon: IconLogout,
  },

  [AttendanceExplanationType.MISSING_CHECK_IN]: {
    label: "Thiếu check-in",
    className: "bg-[#17C964]/10 text-[#17C964]", // map với MissingPunch (Quên chấm công)
    icon: IconLogin,
  },

  [AttendanceExplanationType.MISSING_CHECK_OUT]: {
    label: "Thiếu check-out",
    className: "bg-[#17C964]/10 text-[#17C964]",
    icon: IconLogout,
  },

  [AttendanceExplanationType.ABSENT]: {
    label: "Vắng mặt",
    className: "bg-[#9734EE]/10 text-[#9734EE]",
    icon: IconUserOff,
  },

  [AttendanceExplanationType.MISSING_HOURS]: {
    label: "Thiếu giờ làm",
    className: "bg-[#FF93B8]/10 text-[#FF93B8]", // khớp ShortHours
    icon: IconAlertCircle,
  },

  [AttendanceExplanationType.BUSINESS_TRIP]: {
    label: "Công tác",
    className: "bg-[#F5AF24]/10 text-[#F5AF24]", // khớp Overtime trong legend
    icon: IconBriefcase,
  },

  [AttendanceExplanationType.SICK]: {
    label: "Nghỉ ốm",
    className: "bg-[#A855F7]/10 text-[#A855F7]", // map gần với PaidLeave (nghỉ phép)
    icon: IconStethoscope,
  },

  [AttendanceExplanationType.OTHER]: {
    label: "Khác",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", // neutral, không có trong legend
    icon: IconDots,
  },
};