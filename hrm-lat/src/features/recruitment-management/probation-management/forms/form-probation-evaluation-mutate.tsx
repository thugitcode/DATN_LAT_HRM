import { useMemo } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { Button, Tab, Tabs } from '@heroui/react';
import { FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { useDirtyDrawer } from '@/hooks/use-dirty-drawer';
import { BtnCancel } from '@/components/btn-cancel';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormSelect } from '@/components/form-fields/form-select';
import { ScoreBar } from '@/components/score-bar';

import { DetailEvaluationTab } from '../components/detail-evaluation-tab';
import { ProbationExtendModal } from '../components/probation-extend-modal';
import { ResultEvaluationTab } from '../components/result-evaluation-tab';
import { useFormProbationEvaluation } from '../hooks/use-form-probation-evaluation';
import type { ProbationItem } from '../types/probation.type';

interface DrawerData {
  probationId: string;
  dataRow?: ProbationItem;
}

/* ─── Score bar display ──────────────────────────────────── */

/* ─── "Kết quả đánh giá" tab ────────────────────────────── */

/* ─── "Chi tiết đánh giá" tab (score inputs) ─────────────── */

/* ─── Main drawer ─────────────────────────────────────────── */
export function FormProbationEvaluationMutate() {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const onClose = useDrawer((s) => s.onClose);
  const drawerData = useDrawer((s) => s.data) as DrawerData | undefined;

  const { probationId = '', dataRow } = drawerData ?? {};
  const { options: staffOptions } = useStaffOptions();

  const { methods, isSubmitting, onSaveDraft, onApprove, onExtend, onReject } =
    useFormProbationEvaluation({ probationId, onSuccess: onClose });

  useDirtyDrawer(methods.formState.isDirty);

  const { control, watch } = methods;

  const employeeName = dataRow?.name ?? '';
  const jobTitle = dataRow?.jobTitle?.name ?? '';
  const department = dataRow?.department?.name ?? '';

  const professionalScore = watch('professionalScore');
  const attitudeScore = watch('attitudeScore');
  const communicationScore = watch('communicationScore');

  const criteria = useMemo(
    () => [
      {
        label: t('probation.evaluation_form.score_professional'),
        score: professionalScore ?? null,
      },
      { label: t('probation.evaluation_form.score_attitude'), score: attitudeScore ?? null },
      {
        label: t('probation.evaluation_form.score_communication'),
        score: communicationScore ?? null,
      },
    ],
    [t, professionalScore, attitudeScore, communicationScore],
  );

  const validScores = criteria.map((c) => c.score).filter((s): s is number => s !== null);
  const avg =
    validScores.length > 0
      ? +(validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : null;

  return (
    <div className="relative h-full overflow-hidden bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-[#F4F4F5]">
        <h2 className="text-2xl font-bold text-[#11181C]">
          {t('probation.evaluation_form.title')}
        </h2>
      </div>

      <FormProvider {...methods}>
        <ProbationExtendModal />
        <div className="flex flex-col gap-4 overflow-y-auto p-6 h-[calc(100vh-136px)]">
          {/* Employee info card */}
          <div className="bg-white rounded-xl p-6">
            {employeeName && (
              <div className="bg-white rounded-xl py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {employeeName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-[#11181C]">{employeeName}</p>
                    {(jobTitle || department) && (
                      <p className="text-xs text-[#71717A]">
                        {[jobTitle, department].filter(Boolean).join(' - ')}
                      </p>
                    )}
                  </div>
                </div>
                {dataRow?.probationReviewRound && (
                  <span className="text-xs text-[#71717A]">
                    {t('probation.evaluation_form.template_label', {
                      round: dataRow.probationReviewRound,
                    })}
                  </span>
                )}
              </div>
            )}
            {/* Round banner */}
            <div className="border border-[#11111126] rounded-xl">
              {(dataRow?.probationStartDate || dataRow?.probationEndDate) && (
                <div className="bg-[#2C3782] text-white rounded-t-xl px-4 py-2.5 text-sm font-medium">
                  {t('probation.evaluation_form.round_banner', {
                    start: dataRow?.probationStartDate ?? '',
                    end: dataRow?.probationEndDate ?? '',
                  })}
                </div>
              )}
              <div className="p-3 flex flex-col gap-3">
                <div className="flex gap-1">
                  {t('probation.evaluation_form.progress')}{' '}
                  <div className="flex flex-1 items-center gap-3">
                    <ScoreBar score={50} classNames={{ wrapper: '' }} maxScore={90} />
                    <span className="text-sm font-semibold text-primary w-fit text-right">
                      {50}/90 {t('probation.evaluation.col_date').toLowerCase()}
                    </span>
                  </div>
                </div>
                {/* Reviewer + evaluation date */}
                <div className="bg-white rounded-xl grid grid-cols-2 gap-4">
                  <FormSelect
                    control={control}
                    name="reviewerId"
                    label={t('probation.evaluation_form.reviewer')}
                    isRequired
                    options={staffOptions.map((s) => ({ key: s.key, label: s.label }))}
                    placeholder={t('probation.evaluation_form.reviewer')}
                  />
                  <FormDatePicker
                    control={control}
                    name="evaluationDate"
                    label={t('probation.evaluation_form.evaluation_date')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            aria-label="evaluation tabs"
            variant="underlined"
            color="primary"
            classNames={{
              base: 'w-full border-b border-[#11111126]',
              // tabList: 'bg-white rounded-t-xl px-4 pt-2 border-b border-[#F4F4F5] w-full gap-4',
              panel: 'p-0',
            }}
          >
            <Tab key="result" title={t('probation.evaluation_form.tab_result')}>
              <ResultEvaluationTab
                avg={avg}
                criteria={criteria}
                isSubmitting={isSubmitting}
                onApprove={onApprove}
                onExtend={onExtend}
                onReject={onReject}
              />
            </Tab>
            <Tab key="detail" title={t('probation.evaluation_form.tab_detail')}>
              <DetailEvaluationTab avg={avg} criteria={criteria} dataRow={dataRow} />
            </Tab>
          </Tabs>
        </div>
      </FormProvider>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full bg-white border-t border-[#F4F4F5] px-6 py-4 flex justify-end gap-2 z-10">
        <BtnCancel isDisabled={isSubmitting} onPress={onClose} className="border-1" />
        <Button
          color="primary"
          className="rounded-xl font-medium"
          isLoading={isSubmitting}
          onPress={onSaveDraft}
        >
          {t('probation.evaluation_form.btn_save')}
        </Button>
      </div>
    </div>
  );
}
