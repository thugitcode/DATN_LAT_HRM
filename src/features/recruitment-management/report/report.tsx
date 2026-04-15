import { PageContainer } from '@/components/page-container';
import { TitlePage } from '@/components/title-page';
import { NAMESPACES } from '@/i18n/constants';
import { recruitmentDashboardQueryOptions } from '@/services/query-options/recruitment-management/recruitment-dashboard.query';
import { Button } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconFilter,
  IconPrinter,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const DONUT_COLORS = ['#3B82F6', '#1E293B', '#2DD4BF', '#CBD5E1'];

// ─── Summary card ────────────────────────────────────────────────────────────
function SummaryCard({ label, value, isRate }: { label: string; value?: number; isRate?: boolean }) {
  const display = value === undefined ? '—' : isRate ? `${value}%` : String(value);
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-white p-4 shadow-sm min-w-0">
      <p className="text-xs text-gray-500 leading-tight">{label}</p>
      <p className="text-2xl font-bold text-primary">{display}</p>
    </div>
  );
}

// ─── Custom donut centre label ────────────────────────────────────────────────
function DonutCenterLabel({ viewBox, total, label }: { viewBox?: { cx: number; cy: number }; total: number; label: string }) {
  const cx = viewBox?.cx ?? 0;
  const cy = viewBox?.cy ?? 0;
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan x={cx} dy="-0.4em" fontSize={22} fontWeight={700} fill="#3B82F6">
        {total}
      </tspan>
      <tspan x={cx} dy="1.4em" fontSize={12} fill="#6B7280">
        {label}
      </tspan>
    </text>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export const RecruitmentReport = () => {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const params = { month, year };

  const { data: periodData } = useQuery(recruitmentDashboardQueryOptions.period(params));
  const { data: summaryData } = useQuery(recruitmentDashboardQueryOptions.summary(params));
  const { data: deptData } = useQuery(recruitmentDashboardQueryOptions.byDepartment(params));
  const { data: sourceData } = useQuery(recruitmentDashboardQueryOptions.candidateSource(params));

  const period = periodData?.data;
  const summary = summaryData?.data;
  const dept = deptData?.data;
  const source = sourceData?.data;

  const handlePrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const summaryCards: { key: string; value: number | undefined; isRate?: boolean }[] = [
    { key: 'total_requests', value: summary?.totalRecruitmentRequests },
    { key: 'total_candidates', value: summary?.totalCandidates },
    { key: 'total_interviews', value: summary?.totalInterviewsThisMonth },
    { key: 'offer_acceptance_rate', value: summary?.offerAcceptanceRate, isRate: true },
    { key: 'in_progress_probation', value: summary?.inProgressProbationCount },
    { key: 'waiting_evaluation_probation', value: summary?.waitingEvaluationProbationCount },
    { key: 'converted_official', value: summary?.convertedOfficialCount },
    { key: 'on_time_hiring_rate', value: summary?.onTimeHiringRate, isRate: true },
  ];

  const barData = (dept?.items ?? []).map((item) => ({
    name: item.departmentName,
    value: item.requestedQuantity,
  }));

  const pieData = (source?.items ?? []).map((item) => ({
    name: item.source,
    value: item.count,
    percentage: item.percentage,
  }));

  const quarter = period?.quarter ?? dept?.quarter;

  return (
    <PageContainer className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <TitlePage title={t('report.title')} />
        <div className="flex items-center gap-2">
          <Button isIconOnly variant="light" size="sm"><IconFilter size={18} /></Button>
          <Button isIconOnly variant="light" size="sm"><IconDownload size={18} /></Button>
          <Button isIconOnly variant="light" size="sm"><IconPrinter size={18} /></Button>
        </div>
      </div>

      {/* ── Month navigator ── */}
      <div className="flex items-center gap-1">
        <Button isIconOnly variant="light" size="sm" onPress={handlePrevMonth}>
          <IconChevronLeft size={16} />
        </Button>
        <span className="text-sm font-medium px-1">
          {t('report.month_nav', { month, year })}
        </span>
        <Button isIconOnly variant="light" size="sm" onPress={handleNextMonth}>
          <IconChevronRight size={16} />
        </Button>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {summaryCards.map(({ key, value, isRate }) => (
          <SummaryCard
            key={key}
            label={t(`report.summary.${key}` as never)}
            value={value}
            isRate={isRate}
          />
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar chart – by department */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold mb-4">
            {t('report.charts.by_department_title', { quarter: quarter ?? '—' })}
          </p>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
              {t('report.charts.no_data')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData} barCategoryGap="40%" margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#F1F5F9' }}
                  contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" name={t('report.charts.by_department_y_label')} fill="#4DB6AC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut chart – candidate source */}
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold mb-4">{t('report.charts.candidate_source_title')}</p>
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
              {t('report.charts.no_data')}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={2}
                  >
                    {pieData.map((_entry, index) => (
                      <Cell key={index} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                    {source && (
                      <Label
                        content={(props) => (
                          <DonutCenterLabel
                            viewBox={props.viewBox as { cx: number; cy: number }}
                            total={source.totalCandidates}
                            label={t('report.charts.candidate_source_center_label')}
                          />
                        )}
                        position="center"
                      />
                    )}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex flex-col gap-2 text-sm">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span
                      className="inline-block w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                    />
                    <span className="text-gray-600">
                      {entry.name} – {entry.percentage}% ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
