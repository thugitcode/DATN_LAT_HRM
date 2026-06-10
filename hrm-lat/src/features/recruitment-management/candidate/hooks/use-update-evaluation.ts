import { CandidateStatusEnum } from '@/features/recruitment-management/recruitment-request-details/types/candidate.type';
import { QUERY_KEY } from '@/hooks/use-crud-query';
import { candidateService } from '@/services/recruitment-management/candidate.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateEvaluation(candidateId: string) {
  const queryClient = useQueryClient()
  const { mutateAsync: updateStatus, isPending } = useMutation({
    mutationFn: (status: CandidateStatusEnum) => {
      return candidateService.updateEvaluation(candidateId, { status });
    },
  });

  const handleNext = async () => {
    await updateStatus(CandidateStatusEnum.WAITING_OFFER, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CANDIDATE, "detail", candidateId] })
      }
    });
  };

  const handleWatchMore = async () => {
  };

  const handleReject = async () => {
    await updateStatus(CandidateStatusEnum.REJECTED, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CANDIDATE, "detail", candidateId] })
      }
    })
  };

  return { handleNext, handleWatchMore, handleReject, isPending };
}
