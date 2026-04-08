import { candidateQueryOptions } from "@/services/query-options/recruitment-management/candidate.query";
import { candidateService } from "@/services/recruitment-management/candidate.service";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { ICreateOfferLetterPayload } from "../../recruitment-request-details/types/type";

export const useDetailsOfferCandidate = (candidateId: string) => {
    return useQuery(candidateQueryOptions.detailsOffer(candidateId));
}

export const useCreateOfferCandidate = (candidateId: string) => {
    const { mutateAsync: createOffer } = useMutation({
        mutationFn: (payload: ICreateOfferLetterPayload) => candidateService.createOffer(candidateId, payload),
    });
    return { createOffer };
}