import { NAMESPACES } from '@/i18n/constants';
import type { TOptions } from 'i18next';
import { useTranslation } from 'react-i18next';

export const useTimekeepingTranslation = () => {
  const { t, i18n } = useTranslation([NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING, NAMESPACES.COMMON]);

  const tc = (key: string, options?: TOptions) =>
    t(key as never, { ns: NAMESPACES.COMMON, ...options });

  return { t, tc, i18n };
};
