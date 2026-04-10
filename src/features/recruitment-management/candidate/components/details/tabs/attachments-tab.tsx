import { IconDownload } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import type { ICandidate } from '@/features/recruitment-management/recruitment-request-details/types/candidate.type';
import { icons } from '@/lib/icons';

interface AttachmentsTabProps {
  candidate: ICandidate;
}

export function AttachmentsTab({ candidate }: AttachmentsTabProps) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT) as any;

  if (candidate.documents.length === 0) {
    return <p className="text-sm text-[#71717A]">{t('candidate.detail.no_attachments')}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {icons.document} <span className="font-medium text-lg leading-7">{t('candidate.detail.tabs.attachments')}</span>
      </div>
      {candidate?.documents?.[0]?.fileUrl && <iframe src={candidate?.documents?.[0]?.fileUrl} title="CV" className="w-full h-[calc(100vh-250px)]" />}
      {/* {candidate.documents.map((doc) => (
        <a
          key={doc.id}
          href={doc.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E4E7] hover:bg-[#F4F4F5] transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-[#EEF5FF] flex items-center justify-center shrink-0">
            <IconDownload size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#11181C] truncate">{doc.fileName}</p>
            <p className="text-xs text-[#71717A]">{(doc.fileSize / 1024).toFixed(1)} KB</p>
          </div>
        </a>
      ))} */}
    </div>
  );
}
