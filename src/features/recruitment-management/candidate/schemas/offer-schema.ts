import { z } from 'zod';
import type { TFunction } from 'i18next';
import type { NAMESPACES } from '@/i18n/constants';

import { normalizeString, optionalString, requiredString } from './schema';

export const offerSchema = (t: TFunction<typeof NAMESPACES.RECRUITMENT_MANAGEMENT>) =>
  z.object({
    offerPosition: requiredString(t('candidate.offer.validation.position_required')),
    offerDepartment: requiredString(t('candidate.offer.validation.department_required')),
    baseSalary: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
      z.number({ error: t('candidate.offer.validation.base_salary_required') }).min(0),
    ),
    allowance: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
      z.number().min(0),
    ),
    specialAllowance: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
      z.number().min(0),
    ),
    offerStartDate: requiredString(t('candidate.offer.validation.start_date_required')),
    probationMonths: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? 0 : Number(v)),
      z.number().min(0),
    ),
    offerApproverId: requiredString(t('candidate.offer.validation.approver_required')),
    offerDocumentFile: z.any().optional(),
    offerNotes: optionalString().nullable(),
  });

export type OfferFormValues = z.infer<ReturnType<typeof offerSchema>>;

export const OFFER_DEFAULT_VALUES: OfferFormValues = {
  offerPosition: '',
  offerDepartment: '',
  baseSalary: 0,
  allowance: 0,
  specialAllowance: 0,
  offerStartDate: '',
  probationMonths: 2,
  offerApproverId: '',
  offerDocumentFile: undefined,
  offerNotes: '',
};
