import { useMutation, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEY } from '@/hooks/use-crud-query';
import { candidateService } from '@/services/recruitment-management/candidate.service';
import type { CandidateStatusEnum } from '../types/candidate.type';

export function useCandidateUpdateStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CandidateStatusEnum }) =>
      candidateService.patch(id, { status }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CANDIDATE, 'list'] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CANDIDATE, 'detail', variables.id] });
    },
  });
}
