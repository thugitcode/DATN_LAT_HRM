import { Input } from '@heroui/react';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';

export function ProbationPeriodSection() {
  const { control, watch, setValue } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const probationStartDate = watch('probationStartDate');
  const probationMonths = watch('probationMonths');

  // Auto-calculate end date
  useEffect(() => {
    if (probationStartDate && probationMonths > 0) {
      const endDate = dayjs(probationStartDate)
        .add(probationMonths, 'month')
        .subtract(1, 'day')
        .format('YYYY-MM-DD');
      setValue('probationEndDate', endDate);
    }
  }, [probationStartDate, probationMonths, setValue]);

  const endDateDisplay = watch('probationEndDate');

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-base flex items-center font-semibold text-[#11181C] gap-3">
        {icons.calendarFill}
        {t('probation.form.sections.period')}
      </h3>

      <div className="grid grid-cols-3 gap-4">
        <FormDatePicker
          control={control}
          name="probationStartDate"
          label={t('probation.form.fields.start_date')}
          isRequired
        />

        <FormNumberInput
          control={control}
          name="probationMonths"
          label={t('probation.form.fields.probation_months')}
          placeholder="2"
          isRequired
        />

        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#11181C]">
            {t('probation.form.fields.end_date_expected')}
          </span>
          <Input
            value={endDateDisplay ? dayjs(endDateDisplay).format('DD/MM/YYYY') : ''}
            isDisabled
            classNames={{
              inputWrapper: 'bg-[#F4F4F5] shadow-none border-none',
              input: 'text-[#71717A]',
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormDatePicker
          control={control}
          name="actualStartDate"
          label={t('probation.form.fields.actual_start_date')}
        />

        <FormDatePicker
          control={control}
          name="probationReviewDate"
          label={t('probation.form.fields.review_date')}
          isRequired
        />
      </div>
    </div>
  );
}
