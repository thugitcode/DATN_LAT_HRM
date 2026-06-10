import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormFileUploadInput } from '@/components/form-fields/form-file-upload-input';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';

export function DocumentsSection() {
  const { control } = useFormContext<any>();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <div>
        <h3 className="text-base flex gap-3 font-semibold text-[#11181C]">
          {icons.diplomaVerified}{t('candidate.form.sections.documents')}
        </h3>
        {/* <p className="text-xs text-[#71717A] mt-1">
          {t('candidate.form.sections.documents_description')}
        </p> */}
      </div>

      <FormFileUploadInput
        control={control}
        name="documents"
        // label={t('candidate.form.fields.documents')}
        accept=".pdf"
        maxSize={1048576}
        multiple
        description={t('candidate.form.fields.documents_hint')}
      />
      {/* <p className="text-xs text-[#71717A] -mt-2">
        {t('candidate.form.fields.documents_hint')}
      </p> */}
    </div>
  );
}
