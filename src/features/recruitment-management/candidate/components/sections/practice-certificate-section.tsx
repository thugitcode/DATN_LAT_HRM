import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { IconInfoCircle } from '@tabler/icons-react';

import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormFileUploadInput } from '@/components/form-fields/form-file-upload-input';
import { FormInput } from '@/components/form-fields/form-input';
import { NAMESPACES } from '@/i18n/constants';
import { icons } from '@/lib/icons';

export function PracticeCertificateSection() {
  const { control } = useFormContext<any>();
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <h3 className="text-base flex font-semibold text-[#11181C] gap-3">
        {icons.diplomaVerified}{t('candidate.form.sections.practice_certificate')}
      </h3>

      {/* Note */}
      <div className="flex items-start gap-2 bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
        <IconInfoCircle size={16} className="text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-primary-700">
          {t('candidate.form.sections.practice_certificate_note')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          control={control}
          name="practiceNumber"
          label={t('candidate.form.fields.practice_number')}
          placeholder="Nhập"
        />

        <FormDatePicker
          control={control}
          name="practiceIssueDate"
          label={t('candidate.form.fields.practice_issue_date')}
        />

        <FormInput
          control={control}
          name="practiceIssuePlace"
          label={t('candidate.form.fields.practice_issue_place')}
          placeholder="Nhập"
        />

        <FormInput
          control={control}
          name="practiceScope"
          label={t('candidate.form.fields.practice_scope')}
          placeholder="Nhập"
        />

        <div className="col-span-2">
          <FormFileUploadInput
            control={control}
            name="practiceFileUrl"
            label={t('candidate.form.fields.practice_file')}
            accept=".pdf"
            maxSize={1048576}
            multiple={false}
          />
          {/* <p className="text-xs text-[#71717A] mt-1">
            {t('candidate.form.fields.practice_file_hint')}
          </p> */}
        </div>
      </div>
    </div>
  );
}
