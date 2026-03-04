export interface ShiftDetails {
  id: string;
  workDate: string;
  startTime: string;
  endTime: string;
  status: string;
  displayCode: string;
  staff: Staff;
  shift: Shift;
  totalWorkHours: number;
  totalCompHours: number;
  attendance: Attendance;
  departmentName: string;
  roomName: string;
  noteStartTime: string | null;
  noteEndTime: string | null;
  note: string | null;
  histories: History[];
  rooms?: { id: string, name: string }[];
  departments?: { id: string, name: string }[];
}

export interface Staff {
  id: string;
  code: string;
  name: string;
  avatar: string | null;
}

export interface Shift {
  id: string;
  code: string;
  name: string;
  color: string | null;
  type: string;
  startTime?: string;
  endTime?: string
}

export interface Attendance {
  checkInTime: string;
  checkOutTime: string;
  checkInImage: string | null;
  checkOutImage: string | null;
  checkInLocation: string | null;
  checkOutLocation: string | null;
  checkInMethod: string;
  checkOutMethod: string;
}


export enum CheckInMethodEnum {
  BIOMETRIC = 'BIOMETRIC', // Máy chấm công (vân tay/thẻ)
  GPS = 'GPS', // GPS (Mobile app)
  WIFI = 'WIFI', // Wifi
  QR_CODE = 'QR_CODE', // QR Code
  MANUAL = 'MANUAL', // Nhập tay
}