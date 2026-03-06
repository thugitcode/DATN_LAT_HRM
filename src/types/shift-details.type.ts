export interface IStaff {
  name: string;
  code: string;
  position: string;
  department: string;
  room: string;
}

export interface DailyAttendance {
  date: string;
  shiftCode: string;
  standardTime: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  lateMinutes: number;
  earlyMinutes: number;
  workCount: number;
  totalWorkHours: number;
  overtimeHours: number;
  compHours: number;
}

export interface DetailsTimeSheetRecord {
  staff: IStaff;
  days: DailyAttendance[];
}

export interface DetailsTimeSheetQueryParams {
  // 'x-tenant-id': string;
  order?: 'ASC' | 'DESC';
  id?: string;
  page?: number;
  limit?: number;
  search?: string;
  getAll?: boolean;
  fromDate?: string;
  toDate?: string;
  staffId?: string;
  departmentId?: string;
  roomId?: string;
}
