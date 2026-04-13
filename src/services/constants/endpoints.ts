export const API_ENDPOINTS = {
  HRM: {
    WORK_SCHEDULE: '/work-schedule',
    WORK_SCHEDULE_RANGE: '/work-schedule/range',
    STAFF: '/staff',
    STAFF_PROFILE: '/staff-document',
    STAFF_REVENUE: '/staff-revenue',

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
      GENERAL_REQUEST: '/general-request',
    },

    PAYROLL_MANAGEMENT: {
      PAYROLL_FEEDBACK: '/payroll/feedback',
      KPI: '/staff-kpi',
      OTHER_INCOME: '/other-income',
      SALARY_STAFF_HISTORY: '/payroll/staff',
      PAYROLL_PERIODS: '/payroll/periods',
      PAYROLL_BY_MONTH: '/payroll/by-month',
      PAYROLL_SEND_PAYSLIP: '/payroll/send-payslip',
    },

    LEAVE_REQUEST: '/leave-request',
    RECRUITMENT_REQUEST: '/recruitment-request',
    CANDIDATE: '/candidate',
    INTERVIEW_SCHEDULE: '/interview-schedule',
    OFFER_LETTER: '/offer-letter',
    PROBATION: '/staff/probation',
    UPLOAD: '/upload',

    CONFIGURATION: '/configuration',
    TAX: '/tax',
  },

  OTHER_SERVICE: {
    // Sau nhỡ sang CIS thì thêm
  },
} as const;
