// src/i18n/types.ts
import type common from '@public/locales/en/common.json';
import type dashboard from '@public/locales/en/dashboard.json';
// import type contractManagement from '@public/locales/en/contract-management.json';
import type leaveManagement from '@public/locales/vi/leave-management.json';
import type otherRequestsManagement from '@public/locales/vi/other-requests-management.json';
import type payrollManagement from '@public/locales/vi/payroll-management.json';
// import type auth from '@public/locales/en/auth.json';
import type staffManagement from '@public/locales/vi/staff-management.json';
import type recruitmentManagement from '@public/locales/en/recruitment-management.json';
// import type managementReport from '@public/locales/en/management-report.json';
import type timekeepingShiftScheduling from '@public/locales/vi/timekeeping-shift-scheduling.json';
import type explanationManagement from '@public/locales/vi/explanation-management.json';

import type { NAMESPACES } from './constants';

type I18nResources = {
  [NAMESPACES.COMMON]: typeof common;
  [NAMESPACES.DASHBOARD]: typeof dashboard;
  // [NAMESPACES.AUTH]: typeof auth;
  [NAMESPACES.STAFF_MANAGEMENT]: typeof staffManagement;
  // [NAMESPACES.CONTRACT_MANAGEMENT]: typeof contractManagement;
  [NAMESPACES.LEAVE_MANAGEMENT]: typeof leaveManagement;
  [NAMESPACES.PAYROLL_MANAGEMENT]: typeof payrollManagement;
  [NAMESPACES.RECRUITMENT_MANAGEMENT]: typeof recruitmentManagement;
  // [NAMESPACES.MANAGEMENT_REPORT]: typeof managementReport;
  [NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING]: typeof timekeepingShiftScheduling;
  [NAMESPACES.OTHER_REQUESTS_MANGAGEMENT]: typeof otherRequestsManagement;
  [NAMESPACES.EXPLANATION_MANAGEMENT]: typeof explanationManagement;
};

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof NAMESPACES.COMMON;
    resources: I18nResources;
  }
}
