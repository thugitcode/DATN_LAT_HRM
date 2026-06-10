import { Input } from '@heroui/react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconClipboardList } from '@tabler/icons-react';

import { FormArea } from '@/components/form-fields/form-area';
import { FormCheckbox } from '@/components/form-fields/form-checkbox';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';

const CHECKLIST_ITEMS = [
  { completedField: 'onboardingDocumentsCompleted', noteField: 'onboardingDocumentsNote', labelKey: 'probation.form.checklist.documents' },
  { completedField: 'onboardingContractSigned', noteField: 'onboardingContractNote', labelKey: 'probation.form.checklist.contract' },
  { completedField: 'onboardingSystemAccountCreated', noteField: 'onboardingSystemAccountNote', labelKey: 'probation.form.checklist.system_account' },
  { completedField: 'onboardingStaffCardIssued', noteField: 'onboardingStaffCardNote', labelKey: 'probation.form.checklist.staff_card' },
  { completedField: 'onboardingUniformIssued', noteField: 'onboardingUniformNote', labelKey: 'probation.form.checklist.uniform' },
  { completedField: 'onboardingOrientationCompleted', noteField: 'onboardingOrientationNote', labelKey: 'probation.form.checklist.orientation' },
] as const;

export function ProbationOnboardingSection() {
  const { control, register } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-base flex items-center font-semibold text-[#11181C] gap-3">
        {icons.documentMedicine}
        {t('probation.form.sections.onboarding' as any)}
      </h3>

      {/* Checklist */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-[#11181C] mb-1">
          {t('probation.form.checklist_title' as any)}
        </span>

        {CHECKLIST_ITEMS.map((item) => (
          <div key={item.completedField} className="flex flex-col gap-1 py-1">
            <FormCheckbox
              control={control}
              name={item.completedField}
              label={t(item.labelKey as any)}
            />
            <Input
              {...register(item.noteField)}
              placeholder="Nhập ghi chú..."
              size="sm"
              classNames={{
                inputWrapper: 'ml-6 bg-[#F4F4F5] shadow-none border-none min-h-7 h-7 w-[calc(100%-24px)]',
                input: 'text-xs text-[#71717A] placeholder:text-xs',
              }}
            />
          </div>
        ))}
      </div>

      {/* Work Objectives */}
      <FormArea
        control={control}
        name="probationWorkObjectives"
        label={t('probation.form.fields.work_objectives' as any)}

        minRows={3}
      />
    </div>
  );
}
