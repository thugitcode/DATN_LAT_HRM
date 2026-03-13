export const API_ENDPOINTS = {
  HRM: {
    WORK_SCHEDULE: '/work-schedule',
    WORK_SCHEDULE_RANGE: '/work-schedule/range',
    STAFF: '/staff',
    STAFF_PROFILE: '/staff-profile',

    ROOM: '/room',
    DEPARTMENT: '/department',

    SHIFT_TEMPLATE: '/shift-template',

    _WORK_SCHEDULE: {
      ATTENDANCE_TABLE: '/work-schedule/attendance-table',
      ATTENDANCE_BY_HOURS: '/work-schedule/attendance-by-hours',
    },
    SHIFT_DETAILS: '/work-schedule/detailed-attendance-table',

    ATTENDANCE_EXPLANATION: '/attendance-explanation',

    OTHER_REQUESTS_MANAGEMENT: {
      BUSINESS_TRIP: '/other-request',
      OVERTIME: '/overtime',
      REMOTE_WORK: '/remote-work',
      TRAINING: '/training',
    },

    LEAVE_REQUEST: '/leave-request',
    UPLOAD: '/upload',
  },

  OTHER_SERVICE: {
    // Sau nhỡ sang CIS thì thêm
  },
} as const;
