import { NAMESPACES } from '@/i18n/constants';
import { useTranslation } from 'react-i18next';

export const DataSummary = () => {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);

  return <div>DataSummary</div>;
};
