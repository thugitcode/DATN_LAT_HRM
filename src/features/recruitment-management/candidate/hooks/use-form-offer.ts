import { zodResolver } from '@hookform/resolvers/zod';
import { addToast } from '@heroui/react';
import { useForm, type Resolver } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

import { NAMESPACES } from '@/i18n/constants';
import { uploadService } from '@/services/upload.service';
import { hrmInstance } from '@/lib/axios';

import { offerSchema, OFFER_DEFAULT_VALUES, type OfferFormValues } from '../schemas/offer.schema';
import { useCreateOfferCandidate } from './use-candidate-offer';

interface UseFormOfferParams {
  candidateId: string;
  onSuccess?: () => void;
}

export function useFormOffer({ candidateId, onSuccess }: UseFormOfferParams) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();
  const { createOffer } = useCreateOfferCandidate(candidateId);
  const methods = useForm<OfferFormValues>({
    resolver: zodResolver(offerSchema(t)) as Resolver<OfferFormValues>,
    defaultValues: OFFER_DEFAULT_VALUES,
    mode: 'onChange',
  });

  const { handleSubmit, watch, formState: { isSubmitting } } = methods;

  const baseSalary = watch('baseSalary') ?? 0;
  const allowance = watch('allowance') ?? 0;
  const specialAllowance = watch('specialAllowance') ?? 0;
  const totalIncome = Number(baseSalary) + Number(allowance) + Number(specialAllowance);

  const onSubmitDraft = handleSubmit(async (data) => {
    await _submit(data, true);
  });

  const onSubmitSend = handleSubmit(async (data) => {
    await _submit(data, false);
  });

  const _submit = async (data: OfferFormValues, isDraft: boolean) => {
    let offerDocumentUrl: string | null = null;

    const file = data.offerDocumentFile?.[0];
    if (file) {
      const uploadRes = await uploadService.upload(file);
      if (uploadRes.statusCode === 200) {
        offerDocumentUrl = uploadRes.data.url;
      }
    }

    const payload = {
      offerPosition: data.offerPosition,
      offerDepartment: data.offerDepartment,
      baseSalary: Number(data.baseSalary),
      allowance: Number(data.allowance),
      specialAllowance: Number(data.specialAllowance),
      offerStartDate: data.offerStartDate,
      probationMonths: Number(data.probationMonths),
      offerApproverId: data.offerApproverId,
      offerDocumentUrl,
      offerNotes: data.offerNotes || null,
      ...(isDraft ? { offerStatus: 'DRAFT', send: false } : { send: true }),
    };

    try {
      await createOffer(payload);
      await queryClient.invalidateQueries({ queryKey: ['offer', candidateId] });
      onSuccess?.();
    } catch {
      addToast({ title: t('candidate.offer.validation.submit_error' as any), color: 'danger' });
    }
  };

  return { methods, isSubmitting, onSubmitDraft, onSubmitSend, totalIncome };
}
