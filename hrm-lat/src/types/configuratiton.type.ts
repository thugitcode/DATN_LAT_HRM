export interface Configuration {
  id: string;
  wifiCheckInEnabled: boolean;
  gpsCheckInEnabled: boolean;
  biometricCheckInEnabled: boolean;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  radius: number | null;
  attendanceCycleStartDate: number;
  attendanceExplanationReminderDate: number;
  attendanceExplanationDeadline: number;
  autoMergeConsecutiveShifts: boolean;
  createdAt: string;
  updatedAt: string;
}
