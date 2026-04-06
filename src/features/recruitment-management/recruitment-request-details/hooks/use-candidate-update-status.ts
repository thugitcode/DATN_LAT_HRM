import { useMutation, useQueryClient } from '@tanstack/react-query';

import { candidateService } from '@/services/recruitment-management/candidate.service';
import { candidateKeys } from '@/services/query-options/recruitment-management/candidate.query';
import type { CandidateStatusEnum } from '../types/type';

export function useCandidateUpdateStatus(recruitmentRequestId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatusEnum }) =>
      candidateService.patch(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.list(recruitmentRequestId) });
    },
  });
}
