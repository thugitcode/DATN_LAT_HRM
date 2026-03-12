import i18n from '@/i18n';

import { StaffPosition } from '@/types/global.type';

const NS = 'timekeeping-shift-scheduling';

export const tx = (key: string, options?: object) => i18n.t(`${NS}:${key}`, options);

export const ensureNs = () => i18n.loadNamespaces(NS);

export const getStaffPositionMap = (): Record<string, string> => ({
  [StaffPosition.STAFF]: tx('staff_position.staff'),
});
