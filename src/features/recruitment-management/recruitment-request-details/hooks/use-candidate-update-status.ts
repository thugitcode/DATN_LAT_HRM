import { useMutation, useQueryClient } from '@tanstack/react-query';

import { candidateService } from '@/services/recruitment-management/candidate.service';
import { candidateKeys } from '@/services/query-options/recruitment-management/candidate.query';
import { QUERY_KEY } from '@/hooks/use-crud-query';
import type { CandidateStatusEnum } from '../types/candidate.type';

export function useCandidateUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatusEnum }) =>
      candidateService.patch(id, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: candidateKeys.list() });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CANDIDATE, 'detail', variables.id] });
    },
  });
}
