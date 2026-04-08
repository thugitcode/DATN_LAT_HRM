import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';

export function EmptyTab() {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT) as any;
  return <p className="text-sm text-[#71717A]">{t('candidate.detail.no_data')}</p>;
}
