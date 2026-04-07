import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  useCandidateDetail,
  useCreateCandidate,
  useUpdateCandidate,
} from '@/hooks/queries/use-candidate-query';
import { NAMESPACES } from '@/i18n/constants';
import type { CandidatePayload } from '@/features/recruitment-management/recruitment-request-details/types/type';

import { addToast } from '@heroui/react';
import { candidateSchema, DEFAULT_VALUES, type CandidateFormValues } from '../schemas/schema';
import { uploadService } from '@/services/upload.service';

interface UseFormCandidateParams {
  id?: string;
  onSuccess?: () => void;
}

export function useFormCandidate({ id, onSuccess }: UseFormCandidateParams) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const isEditMode = !!id;

  const { data: detailData, isLoading: isDetailLoading } = useCandidateDetail(id ?? '');
  const { mutateAsync: createCandidate } = useCreateCandidate();
  const { mutateAsync: updateCandidate } = useUpdateCandidate();

  const methods = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema(t)),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;

  useEffect(() => {
    if (isEditMode && detailData?.data) {
      reset({ ...DEFAULT_VALUES, ...detailData.data });
    } else {
      reset(DEFAULT_VALUES);
    }
  }, [isEditMode, detailData?.data, reset]);

  const onSubmit = handleSubmit(async (data) => {
    let documents: {
      fileUrl: string;
      filePath: string;
      fileName: string;
      fileType: string;
      fileSize: number;
    }[] = [];

    const documentsToUpload = data?.documents;

    if (documentsToUpload && !documentsToUpload.fileUrl) {
      const uploadRes = await uploadService.uploadMultiple(documentsToUpload);

      if (uploadRes.statusCode === 200) {
        const fileData = uploadRes.data;
        documents = fileData?.map((item) => ({
          fileUrl: item.url,
          filePath: item.filePath,
          fileName: item.fileName,
          fileType: item.fileType,
          fileSize: item.fileSize,
        }));
      }
    }
    let practiceFileUrl = ""
    const practiceFile = data.practiceFileUrl?.[0]
    if (practiceFile) {
      const uploadRes = await uploadService.upload(practiceFile);

      if (uploadRes.statusCode === 200) {
        const fileData = uploadRes.data;
        practiceFileUrl = fileData.url;
      }
    }

    const payload = { ...data, documents, practiceFileUrl } as unknown as CandidatePayload
    try {
      if (isEditMode && id) {
        await updateCandidate({ id, data: payload });
      } else {
        await createCandidate(payload);
      }
      onSuccess?.();
    } catch {
      addToast({ title: t('candidate.validation.name_required'), color: 'danger' });
    }
  });

  return { methods, isEditMode, isSubmitting, onSubmit, isDetailLoading };
}
