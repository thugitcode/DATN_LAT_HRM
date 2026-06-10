import { NAMESPACES } from '@/i18n/constants';
import { Radio, RadioGroup } from '@heroui/react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormArea } from '@/components/form-fields/form-area';
import { cn } from '@/lib/utils';
import { ModalType, useModal } from '@/store/useModal';

import { SummaryScoreCard } from '../../components/summary-score-card';
import type { ProbationEvaluationFormValues } from '../schemas/probation-evaluation.schema';
import { ProbationEvaluationDecisionEnum, type ProbationItem } from '../types/probation.type';
import { ScoreInputRow } from './score-input-row';
import { icons } from '@/lib/icons';

interface ButtonRadioProps {
    value: string;
    selectedValue: string;
    label: string;
    color: 'primary' | 'danger';
}

function ButtonRadio({ value, selectedValue, label, color }: ButtonRadioProps) {
    const isSelected = selectedValue === value;
    return (
        <Radio
            value={value}
            classNames={{
                base: cn(
                    'border min-w-[190px] rounded-xl px-4 py-2 m-0 cursor-pointer h-10 flex items-center [&>div]:w-full [&>div]:items-center [&>div]:relative [&>div>span]:static',
                    isSelected
                        ? color === 'primary'
                            ? 'bg-primary border-primary justify-between'
                            : 'bg-danger border-danger justify-between'
                        : color === 'primary'
                            ? 'border-primary justify-between'
                            : 'border-danger justify-between',
                ),
                label: cn(
                    'text-sm font-medium',
                    isSelected ? 'text-white' : color === 'primary' ? 'text-primary' : 'text-danger',
                ),
                wrapper: 'hidden',
            }}
        >
            <div className="flex justify-between w-full">
                <div>{label}</div>
                {isSelected && <span className='absolute right-[-5px]'><icons.tickCircle fill="white" /></span>}
            </div>
        </Radio>
    );
}

export function DetailEvaluationTab({
    avg,
    criteria,
    dataRow,
}: {
    avg: number | null;
    criteria: { label: string; score: number | null }[];
    dataRow?: ProbationItem;
}) {
    const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
    const { control } = useFormContext<ProbationEvaluationFormValues>();
    const { onOpen } = useModal();

    return (
        <div className="flex flex-col gap-4">
            {/* Score inputs */}
            <div className="bg-white rounded-xl p-4 flex flex-col gap-5">
                <ScoreInputRow
                    name="professionalScore"
                    label={t('probation.evaluation_form.score_professional')}
                />
                <ScoreInputRow name="attitudeScore" label={t('probation.evaluation_form.score_attitude')} />
                <ScoreInputRow
                    name="communicationScore"
                    label={t('probation.evaluation_form.score_communication')}
                />
            </div>

            {/* Other section */}
            <div className="bg-white rounded-xl p-4 flex flex-col gap-4">
                <p className="text-sm font-semibold text-[#11181C]">
                    {t('probation.evaluation_form.other_section')}
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

            <SummaryScoreCard avgScore={avg} criteria={criteria} variant="flat" className="bg-white" />

            {/* Evaluation result */}
            <div className="bg-white p-6 flex gap-3 flex-col justify-between rounded-xl">
                <span className="text-base leading-6 font-medium">
                    {t('probation.evaluation_form.result_evaluation')}
                </span>
                <Controller
                    control={control}
                    name="decision"
                    render={({ field }) => (
                        <RadioGroup
                            orientation="horizontal"
                            value={field.value ?? ''}
                            onValueChange={(val) => {
                                if (val === ProbationEvaluationDecisionEnum.EXTENDED) {
                                    onOpen(ModalType.PROBATION_EXTEND, { dataRow });
                                }
                                field.onChange(val);
                            }}
                            classNames={{ wrapper: 'gap-3' }}
                        >
                            <ButtonRadio
                                value={ProbationEvaluationDecisionEnum.CONVERTED_OFFICIAL}
                                selectedValue={field.value ?? ''}
                                label={t('probation.evaluation_form.pass')}
                                color="primary"
                            />
                            <ButtonRadio
                                value={ProbationEvaluationDecisionEnum.EXTENDED}
                                selectedValue={field.value ?? ''}
                                label={t('probation.evaluation_form.decision_extend')}
                                color="primary"
                            />
                            <ButtonRadio
                                value={ProbationEvaluationDecisionEnum.RESIGNED}
                                selectedValue={field.value ?? ''}
                                label={t('probation.evaluation_form.fail')}
                                color="danger"
                            />
                        </RadioGroup>
                    )}
                />
            </div>
        </div>
    );
}
