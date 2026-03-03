import { AttendanceExplanationType } from "@/types/attendance-explanation.type";
import { IconAlertCircle, IconAlertTriangleFilled, IconBriefcase, IconDots, IconHome, IconLogin, IconLogout, IconStethoscope, IconUserOff, type IconProps } from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { AttendanceStatus } from "../../timekeeping-management/types/index.type";

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


export const attendanceStatusUI: Record<
  AttendanceStatus,
  {
    label: string;
    className: string; // bg-[color]/10 text-[color]
    icon: ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
  } | null // null = không hiển thị badge
> = {
  [AttendanceStatus.OnTime]: null, // Đúng giờ → thường không cần badge

  [AttendanceStatus.Absent]: {
    label: "Vắng mặt",
    className: "bg-[#9734EE]/10 text-[#9734EE]",
    icon: IconUserOff,
  },

  [AttendanceStatus.Late]: {
    label: "Đi muộn",
    className: "bg-[#D55829]/10 text-[#D55829]",
    icon: IconAlertTriangleFilled,
  },

  [AttendanceStatus.EarlyLeave]: {
    label: "Về sớm",
    className: "bg-[#73C9C6]/10 text-[#73C9C6]",
    icon: IconLogout,
  },

  [AttendanceStatus.LateAndEarly]: {
    label: "Muộn + Sớm",
    className: "bg-[#D55829]/10 text-[#D55829]", // ưu tiên màu muộn, hoặc mix nếu muốn
    icon: IconAlertTriangleFilled, // hoặc tạo icon kết hợp
    // Nếu UI hỗ trợ hiển thị 2 badge → bạn có thể trả về array thay vì object
  },

  [AttendanceStatus.Overtime]: {
    label: "Công tác",
    className: "bg-[#F5AF24]/10 text-[#F5AF24]",
    icon: IconBriefcase,
  },

  [AttendanceStatus.WorkFromHome]: {
    label: "Làm tại nhà",
    className: "bg-[#60A5FA]/10 text-[#60A5FA]", // xanh dương nhạt → gợi ý WFH
    icon: IconHome, // nếu có icon Home, hoặc IconDots tạm
  },

  [AttendanceStatus.ShortHours]: {
    label: "Thiếu giờ",
    className: "bg-[#FF93B8]/10 text-[#FF93B8]",
    icon: IconAlertCircle,
  },

  [AttendanceStatus.MissingPunch]: {
    label: "Quên chấm công",
    className: "bg-[#17C964]/10 text-[#17C964]",
    icon: IconLogin, // hoặc mix Login + Logout nếu muốn
  },

  [AttendanceStatus.PaidLeave]: {
    label: "Nghỉ phép",
    className: "bg-[#A855F7]/10 text-[#A855F7]",
    icon: IconStethoscope, // hoặc IconCalendarEvent nếu có
  },

  [AttendanceStatus.DayOff]: null, // Ngày nghỉ → thường không hiển thị badge
};