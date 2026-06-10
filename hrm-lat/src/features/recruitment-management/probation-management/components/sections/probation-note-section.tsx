import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconHash } from '@tabler/icons-react';

import { FormArea } from '@/components/form-fields/form-area';
import { NAMESPACES } from '@/i18n/constants';

export function ProbationNoteSection() {
  const { control } = useFormContext();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-base flex items-center font-semibold text-[#11181C] gap-3">
        <IconHash size={18} />
        {t('probation.form.sections.note' as any)}
      </h3>

      <FormArea
        control={control}
        name="note"
        label={t('probation.form.fields.note' as any)}
        placeholder="Nhập ghi chú"
        minRows={4}
      />
    </div>
  );
}
