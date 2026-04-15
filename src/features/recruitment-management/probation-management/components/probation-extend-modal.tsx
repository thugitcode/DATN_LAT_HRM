import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '@heroui/react';
import { IconInfoCircle } from '@tabler/icons-react';
import { useForm, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { BtnCancel } from '@/components/btn-cancel';
import { FormArea } from '@/components/form-fields/form-area';
import { FormSelect } from '@/components/form-fields/form-select';
import { NAMESPACES } from '@/i18n/constants';
import { ModalType, useModal } from '@/store/useModal';

import type { ProbationEvaluationFormValues } from '../schemas/probation-evaluation.schema';
import { ProbationEvaluationDecisionEnum, type ProbationItem } from '../types/probation.type';

const extendSchema = z.object({
  extendMonths: z.string().min(1, 'Vui lòng chọn thời gian gia hạn'),
  extendReason: z.string().min(1, 'Vui lòng nhập lý do gia hạn'),
});

type ExtendFormValues = z.infer<typeof extendSchema>;

const EXTEND_MONTH_OPTIONS = [
  { key: '1', label: '1 tháng' },
  { key: '2', label: '2 tháng' },
  { key: '3', label: '3 tháng' },
];

function addMonthsToDate(dateStr: string, months: number): string {
  let d: Date;
  if (dateStr.includes('/')) {
    const [day, month, year] = dateStr.split('/').map(Number);
    d = new Date(year!, month! - 1, day);
  } else {
    d = new Date(dateStr);
  }
  d.setMonth(d.getMonth() + months);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

interface ModalData {
  dataRow?: ProbationItem;
}

export function ProbationExtendModal() {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { isOpen, type, data, onClose } = useModal();
  const { setValue } = useFormContext<ProbationEvaluationFormValues>();

  const dataRow = (data as ModalData | undefined)?.dataRow;
  const isVisible = isOpen && type === ModalType.PROBATION_EXTEND;

  const { control, handleSubmit, reset } = useForm<ExtendFormValues>({
    resolver: zodResolver(extendSchema),
    defaultValues: { extendMonths: '', extendReason: '' },
  });

  const extendMonths = useWatch({ control, name: 'extendMonths' });

  const newEndDate =
    dataRow?.probationEndDate && extendMonths
      ? addMonthsToDate(dataRow.probationEndDate, Number(extendMonths))
      : '';

  const handleConfirm = handleSubmit(() => {
    setValue('decision', ProbationEvaluationDecisionEnum.EXTENDED);
    onClose();
    reset();
  });

  const handleCancel = () => {
    setValue('decision', ProbationEvaluationDecisionEnum.IN_PROGRESS);
    onClose();
    reset();
  };

  return (
    <Modal isOpen={isVisible} onClose={handleCancel} size="lg">
      <ModalContent>
        <ModalHeader className="text-lg font-bold">
          {t('probation.evaluation_form.extend_modal_title')}
        </ModalHeader>
        <ModalBody className="flex flex-col gap-4">
          {dataRow && (
            <div className="bg-[#F4F4F5] rounded-xl p-3 flex items-start gap-2">
              <IconInfoCircle size={18} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#11181C]">
                  {t('probation.evaluation_form.extend_employee_label', {
                    name: dataRow.name,
                    code: dataRow.code,
                  })}
                </p>
                {dataRow.probationEndDate && (
                  <p className="text-xs text-[#71717A]">
                    {t('probation.evaluation_form.extend_current_end_date', {
                      date: dataRow.probationEndDate,
                    })}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <FormSelect
              control={control}
              name="extendMonths"
              label={t('probation.evaluation_form.extend_duration_label')}
              isRequired
              options={EXTEND_MONTH_OPTIONS}
              placeholder={t('probation.evaluation_form.extend_duration_placeholder')}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm text-[#71717A]">
                {t('probation.evaluation_form.extend_new_end_date')}
              </label>
              <div className="border border-default-200 rounded-xl px-3 py-2 text-sm text-[#11181C] bg-default-100 min-h-[40px] flex items-center">
                {newEndDate || '—'}
              </div>
            </div>
          </div>

          <FormArea
            control={control}
            name="extendReason"
            label={t('probation.evaluation_form.extend_reason')}
            isRequired
            placeholder={t('probation.evaluation_form.enter_comment')}
          />
        </ModalBody>
        <ModalFooter>
          <BtnCancel onPress={handleCancel} />
          <Button color="primary" onClick={handleConfirm}>
            {t('probation.evaluation_form.extend_confirm')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
