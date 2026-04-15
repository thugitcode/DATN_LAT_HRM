import { Button, Spinner } from '@heroui/react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { useModal } from '@/store/useModal';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import { useProbationEvaluations } from '../hooks/use-probation-list';
import { ProbationEvaluationResultEnum, ProbationStatusEnum } from '../types/probation.type';
import type { ProbationItem } from '../types/probation.type';

export interface ProbationEvaluationModalData {
  probationId: string;
  dataRow: ProbationItem;
}

function EvaluationResultChip({ result }: { result: ProbationEvaluationResultEnum | null }) {
  if (!result) return <span className="text-gray-400">—</span>;

  const isPass = result === ProbationEvaluationResultEnum.PASS;
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
        isPass ? 'bg-[#E8FAF0] text-[#0E793C]' : 'bg-[#FEE7EF] text-[#F31260]'
      }`}
    >
      {isPass ? 'Đạt' : 'Không đạt'}
    </span>
  );
}

export function ProbationEvaluationListModal() {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { onClose } = useModal();
  const { onOpen: openDrawer } = useDrawer();
  const data = useModal((s) => s.data) as ProbationEvaluationModalData;

  const { data: evaluationsRes, isLoading } = useProbationEvaluations(data?.probationId ?? '');
  const evaluations = evaluationsRes?.data ?? [];

  const { dataRow } = data ?? {};
  const isPass = dataRow?.displayProbationStatus === ProbationStatusEnum.PASS;

  return (
    <div className="flex flex-col">
      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Spinner size="md" />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E4E4E7]">
                {[
                  t('probation.evaluation.col_round'),
                  t('probation.evaluation.col_type'),
                  t('probation.evaluation.col_date'),
                  t('probation.evaluation.col_evaluator'),
                  t('probation.evaluation.col_professional'),
                  t('probation.evaluation.col_performance'),
                  t('probation.evaluation.col_attitude'),
                  t('probation.evaluation.col_total'),
                  t('probation.evaluation.col_status'),
                  t('probation.evaluation.col_actions'),
                ].map((header) => (
                  <th
                    key={header}
                    className="px-3 py-3 text-left text-xs font-semibold text-[#71717A] uppercase whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {evaluations.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-[#71717A]">
                    {t('probation.evaluation.no_data')}
                  </td>
                </tr>
              ) : (
                evaluations.map((ev) => (
                  <tr key={ev.id} className="border-b border-[#F4F4F5] hover:bg-[#FAFAFA]">
                    <td className="px-3 py-3">{ev.round}</td>
                    <td className="px-3 py-3">{ev.type}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{ev.date}</td>
                    <td className="px-3 py-3 whitespace-nowrap">{ev.evaluator?.name ?? '—'}</td>
                    <td className="px-3 py-3 text-[#006FEE] font-medium">
                      {ev.professionalScore ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-[#006FEE] font-medium">
                      {ev.performanceScore ?? '—'}
                    </td>
                    <td className="px-3 py-3 text-[#006FEE] font-medium">
                      {ev.attitudeScore ?? '—'}
                    </td>
                    <td className="px-3 py-3 font-medium">{ev.totalScore ?? '—'}</td>
                    <td className="px-3 py-3">
                      <EvaluationResultChip result={ev.result} />
                    </td>
                    <td className="px-3 py-3">
                      <Button
                        size="sm"
                        variant="bordered"
                        color="primary"
                        className="rounded-lg text-xs font-medium border-1 h-7"
                      >
                        {t('probation.evaluation.btn_view')}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Result section — shown when status is PASS */}
      {isPass && (
        <div className="mx-4 mb-4 mt-2 flex items-center justify-between rounded-xl bg-[#E8FAF0] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎉</span>
            <div>
              <p className="text-sm font-semibold text-[#0E793C]">
                {t('probation.evaluation.result_pass_label')}
              </p>
              {dataRow?.probationProposal && (
                <p className="text-xs text-[#3F3F46]">{dataRow.probationProposal}</p>
              )}
            </div>
          </div>
          <Button
            color="success"
            className="rounded-xl text-sm font-medium text-white"
            onPress={() => {
              onClose();
              openDrawer(DrawerType.PROBATION_ACCEPT, {
                probationId: dataRow.id,
                employeeCode: dataRow.code,
                employeeName: dataRow.name,
                jobTitleName: dataRow.jobTitle?.name,
              });
            }}
          >
            {t('probation.actions.accept_official')}
          </Button>
        </div>
      )}
    </div>
  );
}
