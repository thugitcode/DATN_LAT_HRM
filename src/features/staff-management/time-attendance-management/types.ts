import type { AttendanceExplanationStatus } from "@/types/attendance-explanation.type";

// Kiểu thời gian chuẩn HH:mm:ss hoặc HH:mm AM/PM (tùy dữ liệu thực tế)
export type TimeString = string;  // "07:30:00" | "08:10 AM" | "05:30 PM" | ...

// Các loại segment trên timeline
export type TimelineType = "WORK" | "BREAK" | "OT" | "LEAVE" | "OTHER";

// Màu có thể là hex hoặc tên tailwind, nhưng ở đây dùng hex như dữ liệu
export type ColorHex = string;  // "#4CAF50", "#9CA3AF", "#E91E63", "#3B82F6", ...

export interface TimelineSegment {
  type: TimelineType;
  label: string;               // "Làm việc", "Nghỉ giữa ca sáng", "OT", "Nghỉ trưa"...
  startTime: TimeString;
  endTime: TimeString;
  color: ColorHex;
  // Optional: nếu backend đã tính sẵn
  durationMinutes?: number;
}

// Một ngày chấm công
export interface AttendanceDay {
  date: string;                        // "2026-03-01" (yyyy-MM-dd)
  dayOfWeek: string;                   // "Chủ nhật" | "Thứ 2" | ...
  
  checkInTime: TimeString | null;
  checkOutTime: TimeString | null;
  
  totalHoursDisplay: string;           // "9h20", "--", "8h 15m"...
  totalHours: number;                  // 9.33, 0, ...
  
  lateMinutes: number;
  earlyMinutes: number;
  
  explanationStatus: AttendanceExplanationStatus;
  isLeave: boolean;                    // ngày nghỉ phép / không đi làm hợp lệ
  
  shiftCode: string | null;            // "CS, CT" | "CG" | "LH-007, CT-003" | null
  timeline: TimelineSegment[];
}

// Phần tóm tắt tổng hợp (thường của cả tháng/quý/năm)
export interface IAttendanceSummary {
  dayOff: number;               // ngày nghỉ chính thức?
  lateCount: number;            // số lần đi muộn
  earlyLeaveCount: number;      // số lần về sớm
  missedCheckIn: number;        // số ngày thiếu check-in
  remainingLeave: number;       // phép còn lại
  unauthorizedLeave: number;    // nghỉ không phép
  // Có thể mở rộng thêm: totalOvertimeHours, totalWorkDays, absenceCount...
}

// Object chính của một nhân viên trong kỳ chấm công
export interface StaffAttendanceRecord {
  staffId: string;              // UUID
  staffCode: string;            // "NVPSTRP04C"
  staffName: string;            // "Lê Hoàng Phúc"
  position: string;             // "DEPUTY_MANAGER" | "Nhân viên" | ...
  departmentName: string;       // "Khoa Dược"
  
  summary: IAttendanceSummary;
  days: AttendanceDay[];        // danh sách các ngày (thường 1 tháng)
}