import { FormProvider, useFormContext, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input, Tab, Tabs } from '@heroui/react';

import { BtnCancel } from '@/components/btn-cancel';
import { FormArea } from '@/components/form-fields/form-area';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormSelect } from '@/components/form-fields/form-select';
import { useStaffOptions } from '@/hooks/options/use-staff-options';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import { useDirtyDrawer } from '@/hooks/use-dirty-drawer';

import type { ProbationItem } from '../types/probation.type';
import { useFormProbationEvaluation } from '../hooks/use-form-probation-evaluation';
import type { ProbationEvaluationFormValues } from '../schemas/probation-evaluation.schema';

interface DrawerData {
  probationId: string;
  dataRow?: ProbationItem;
}

/* ─── Score bar display ──────────────────────────────────── */
function ScoreBar({ score }: { score: number | null }) {
  const pct = score !== null ? Math.min(Math.max((score / 10) * 100, 0), 100) : 0;
  return (
    <div className="flex-1 h-2 bg-[#E4E4E7] rounded-full overflow-hidden">
      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function ScoreDisplayRow({ label, score }: { label: string; score: number | null }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-[#52525B] w-28 shrink-0">{label}</span>
      <ScoreBar score={score} />
      <span className="text-sm font-semibold text-primary w-8 text-right">
        {score !== null ? score : '—'}
      </span>
    </div>
  );
}

/* ─── Score input field ──────────────────────────────────── */
function ScoreInputRow({ name, label }: { name: keyof ProbationEvaluationFormValues; label: string }) {
  return (
    <Controller<ProbationEvaluationFormValues>
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          value={field.value !== null && field.value !== undefined ? String(field.value) : ''}
          type="number"
          min={0}
          max={10}
          step={0.1}
          label={`${label} (0 – 10)`}
          labelPlacement="outside-top"
          placeholder="0"
          isInvalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
          onChange={(e) => {
            const val = e.target.value;
            field.onChange(val === '' ? null : Number(val));
          }}
          classNames={{ label: 'text-sm font-normal text-[#52525B]' }}
        />
      )}
    />
  );
}

/* ─── "Kết quả đánh giá" tab ────────────────────────────── */
function ResultTab({
  isSubmitting,
  onApprove,
  onExtend,
  onReject,
}: {
  isSubmitting: boolean;
  onApprove: () => void;
  onExtend: () => void;
  onReject: () => void;
}) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { control, watch } = useFormContext<ProbationEvaluationFormValues>();
  const { options: staffOptions } = useStaffOptions();

  const professionalScore = watch('professionalScore');
  const attitudeScore = watch('attitudeScore');
  const communicationScore = watch('communicationScore');

  const validScores = [professionalScore, attitudeScore, communicationScore].filter(
    (s): s is number => s !== null && s !== undefined,
  );
  const avg =
    validScores.length > 0
      ? +(validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
      : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Score summary */}
      <div className="bg-white rounded-xl p-4 flex items-center gap-6">
        <div className="flex flex-col items-center justify-center w-20 h-20 rounded-full border-4 border-primary shrink-0">
          <span className="text-2xl font-bold text-primary leading-none">
            {avg !== null ? avg : '—'}
          </span>
          <span className="text-xs text-[#71717A]">/10</span>
        </div>
        <div className="flex-1 flex flex-col gap-3">
          <ScoreDisplayRow
            label={t('probation.evaluation_form.score_professional')}
            score={professionalScore ?? null}
          />
          <ScoreDisplayRow
            label={t('probation.evaluation_form.score_attitude')}
            score={attitudeScore ?? null}
          />
          <ScoreDisplayRow
            label={t('probation.evaluation_form.score_communication')}
            score={communicationScore ?? null}
          />
        </div>
      </div>

      {/* Reviewer comments */}
      <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
        <p className="text-sm font-semibold text-[#11181C]">
          {t('probation.evaluation_form.reviewer_comment_section')}
        </p>
        <FormArea
          control={control}
          name="generalComment"
          label={t('probation.evaluation_form.general_comment')}
          placeholder={t('probation.evaluation_form.enter_comment')}
        />
        <FormArea
          control={control}
          name="strengths"
          label={t('probation.evaluation_form.strengths')}
          placeholder={t('probation.evaluation_form.enter_comment')}
        />
        <FormArea
          control={control}
          name="improvementAreas"
          label={t('probation.evaluation_form.improvement_areas')}
          placeholder={t('probation.evaluation_form.enter_comment')}
        />
      </div>

      {/* Decision */}
      <div className="bg-white rounded-xl p-4 flex flex-col gap-3">
        <p className="text-sm font-semibold text-[#11181C]">
          {t('probation.evaluation_form.decision_section')}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            color="primary"
            className="rounded-xl text-sm font-medium"
            isLoading={isSubmitting}
            onPress={onApprove}
          >
            {t('probation.evaluation_form.decision_approve')}
          </Button>
          <Button
            variant="bordered"
            color="primary"
            className="rounded-xl text-sm font-medium border-1"
            isLoading={isSubmitting}
            onPress={onExtend}
          >
            {t('probation.evaluation_form.decision_extend')}
          </Button>
          <Button
            variant="bordered"
            color="danger"
            className="rounded-xl text-sm font-medium border-1"
            isLoading={isSubmitting}
            onPress={onReject}
          >
            {t('probation.evaluation_form.decision_reject')}
          </Button>
        </div>
      </div>

      {/* Approver comment */}
      <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
        <p className="text-sm font-semibold text-[#11181C]">
          {t('probation.evaluation_form.approver_comment_section')}
        </p>
        <FormSelect
          control={control}
          name="approverId"
          label={t('probation.evaluation_form.approver')}
          options={staffOptions.map((s) => ({ key: s.key, label: s.label }))}
          placeholder={t('probation.evaluation_form.approver')}
        />
        <FormArea
          control={control}
          name="approverComment"
          label={t('probation.evaluation_form.approver_comment')}
          placeholder={t('probation.evaluation_form.enter_comment')}
        />
      </div>
    </div>
  );
}

/* ─── "Chi tiết đánh giá" tab (score inputs) ─────────────── */
function DetailTab() {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { control } = useFormContext<ProbationEvaluationFormValues>();

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-xl p-4 grid grid-cols-1 gap-4">
        <ScoreInputRow name="professionalScore" label={t('probation.evaluation_form.score_professional')} />
        <ScoreInputRow name="attitudeScore" label={t('probation.evaluation_form.score_attitude')} />
        <ScoreInputRow name="communicationScore" label={t('probation.evaluation_form.score_communication')} />
      </div>
      <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
        <FormArea
          control={control}
          name="reviewerComment"
          label={t('probation.evaluation_form.reviewer_comment')}
          placeholder={t('probation.evaluation_form.enter_comment')}
        />
      </div>
    </div>
  );
}

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

  const { control } = methods;

  const employeeName = dataRow?.name ?? '';
  const jobTitle = dataRow?.jobTitle?.name ?? '';
  const department = dataRow?.department?.name ?? '';

  return (
    <div className="relative h-full overflow-hidden bg-[#FAFAFA]">
      {/* Header */}
      <div className="px-6 py-5 bg-white border-b border-[#F4F4F5]">
        <h2 className="text-2xl font-bold text-[#11181C]">
          {t('probation.evaluation_form.title')}
        </h2>
      </div>

      <FormProvider {...methods}>
        <div className="flex flex-col gap-4 overflow-y-auto p-6 h-[calc(100vh-136px)]">
          {/* Employee info card */}
          {employeeName && (
            <div className="bg-white rounded-xl px-5 py-4 flex items-center justify-between gap-4">
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
          {(dataRow?.probationStartDate || dataRow?.probationEndDate) && (
            <div className="bg-primary text-white rounded-xl px-4 py-2.5 text-sm font-medium">
              {t('probation.evaluation_form.round_banner', {
                start: dataRow?.probationStartDate ?? '',
                end: dataRow?.probationEndDate ?? '',
              })}
            </div>
          )}

          {/* Reviewer + evaluation date */}
          <div className="bg-white rounded-xl p-4 grid grid-cols-2 gap-4">
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

          {/* Tabs */}
          <Tabs
            aria-label="evaluation tabs"
            variant="underlined"
            classNames={{
              base: 'w-full',
              tabList: 'bg-white rounded-t-xl px-4 pt-2 border-b border-[#F4F4F5] w-full gap-4',
              panel: 'p-0',
            }}
          >
            <Tab key="result" title={t('probation.evaluation_form.tab_result')}>
              <ResultTab
                isSubmitting={isSubmitting}
                onApprove={onApprove}
                onExtend={onExtend}
                onReject={onReject}
              />
            </Tab>
            <Tab key="detail" title={t('probation.evaluation_form.tab_detail')}>
              <DetailTab />
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
