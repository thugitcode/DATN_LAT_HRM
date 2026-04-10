import { hrmInstance } from '@/lib/axios';
import type {
  OfferLetter,
  OfferLetterFilters,
  OfferLetterPayload,
} from '@/features/recruitment-management/recruitment-request-details/types/candidate.type';
import { BaseApiService } from '../base-api.service';
import { API_ENDPOINTS } from '../constants/endpoints';

class OfferLetterService extends BaseApiService<
  OfferLetter,
  OfferLetterPayload,
  Partial<OfferLetterPayload>,
  OfferLetterFilters
> {
  constructor() {
    super(hrmInstance, API_ENDPOINTS.HRM.OFFER_LETTER);
  }
}

export const offerLetterService = new OfferLetterService();
