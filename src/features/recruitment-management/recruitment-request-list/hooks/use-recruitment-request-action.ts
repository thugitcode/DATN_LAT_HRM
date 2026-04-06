import { addToast } from '@heroui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { recruitmentRequestKeys } from '@/services/query-options/recruitment-request.query';
import { recruitmentRequestService } from '@/services/recruitment-request.service';

import {
  RecruitmentRequestActionEnum,
  type ActionPayload
} from '../types/type';



const ACTION_FN: {
  [A in RecruitmentRequestActionEnum]: (id: string, payload: ActionPayload[A]) => Promise<unknown>;
} = {
  [RecruitmentRequestActionEnum.SUBMIT]: (id, payload) => recruitmentRequestService.submit(id, payload),
  [RecruitmentRequestActionEnum.APPROVE]: (id, payload) => recruitmentRequestService.approve(id, payload),
  [RecruitmentRequestActionEnum.REJECT]: (id, payload) => recruitmentRequestService.reject(id, payload),
  [RecruitmentRequestActionEnum.CLOSE]: (id) => recruitmentRequestService.close(id),
  [RecruitmentRequestActionEnum.OPEN_RECRUITING]: (id) => recruitmentRequestService.openRecruiting(id),
  [RecruitmentRequestActionEnum.PAUSE]: (id) => recruitmentRequestService.pauseRecruiting(id),
  [RecruitmentRequestActionEnum.RESUME]: (id) => recruitmentRequestService.resumeRecruiting(id),
  [RecruitmentRequestActionEnum.CANCEL]: (id) => recruitmentRequestService.cancelRecruiting(id),
};

export function useRecruitmentRequestAction<A extends RecruitmentRequestActionEnum>(
  action: A,
  id: string,
) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ActionPayload[A]) => ACTION_FN[action](id, payload as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recruitmentRequestKeys.lists() });
      addToast({ description: t(`form.toast.${action}_success` as any), color: 'success' });
    },
    onError: () => {
      addToast({ description: t(`form.toast.${action}_error` as any), color: 'danger' });
    },
  });
}
