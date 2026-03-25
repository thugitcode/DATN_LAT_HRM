export const SUPPORTED_LANGUAGES = {
  VI: 'vi',
  EN: 'en',
} as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[keyof typeof SUPPORTED_LANGUAGES];

export const DEFAULT_LANGUAGE = SUPPORTED_LANGUAGES.VI;

export const LANGUAGE_OPTIONS = [
  { code: SUPPORTED_LANGUAGES.VI, flag: '🇻🇳', label: 'Tiếng Việt' },
  { code: SUPPORTED_LANGUAGES.EN, flag: '🇺🇸', label: 'English' },
] satisfies { code: SupportedLanguage; flag: string; label: string }[];

export const LANGUAGE_STORAGE_KEY = 'app_language';

export const NAMESPACES = {
  COMMON: 'common',
  DASHBOARD: 'dashboard',
  AUTH: 'auth',
  STAFF_MANAGEMENT: 'staff-management',
  CONTRACT_MANAGEMENT: 'contract-management',
  LEAVE_MANAGEMENT: 'leave-management',
  PAYROLL_MANAGEMENT: 'payroll-management',
  RECRUITMENT_MANAGEMENT: 'recruitment-management',
  MANAGEMENT_REPORT: 'management-report',
  TIMEKEEPING_SHIFT_SCHEDULING: 'timekeeping-shift-scheduling',
  OTHER_REQUESTS_MANGAGEMENT: 'other-requests-management',
  EXPLANATION_MANAGEMENT: 'explanation-management',
} as const;

export type Namespace = (typeof NAMESPACES)[keyof typeof NAMESPACES];
