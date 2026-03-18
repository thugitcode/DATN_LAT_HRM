import { useMemo } from 'react';
import { createFileRoute, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { NAMESPACES } from '@/i18n/constants';
import { Tab, Tabs } from '@heroui/react';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/_private/admin/_dashboard/payroll-management/data-summary')({
  component: DataSummaryLayout,
});

function DataSummaryLayout() {
  const { t } = useTranslation(NAMESPACES.PAYROLL_MANAGEMENT);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const TABS = useMemo(
    () => [
      { key: 'attendance-data', label: t('data_summary.tabs.attendance_data') },
      { key: 'revenue', label: t('data_summary.tabs.revenue') },
      { key: 'kpi', label: t('data_summary.tabs.kpi') },
      // { key: 'other-income', label: t('data_summary.tabs.other_income') },
      // { key: 'summary-finalize', label: t('data_summary.tabs.summary_finalize') },
    ],
    [t],
  );

  const DEFAULT_TAB = 'attendance-data';
  const activeTab = TABS.find((tab) => pathname.includes(tab.key))?.key ?? DEFAULT_TAB;

  const handleTabChange = (key: React.Key) => {
    navigate({ to: `/admin/payroll-management/data-summary/${key}` });
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <Tabs
        selectedKey={activeTab}
        onSelectionChange={handleTabChange}
        variant="underlined"
        color="primary"
      >
        {TABS.map((tab) => (
          <Tab key={tab.key} title={tab.label} />
        ))}
      </Tabs>

      <Outlet />
    </div>
  );
}
