import type { Item } from "@/features/timekeeping-shift-scheduling/timekeeping-management/components/work-sheet-by-shift/department-room-info";
import type { EvaluationFormValues } from "../candidate/schemas/evaluation.schema";

export enum CandidateSourceEnum {
    WEBSITE = 'WEBSITE',
    REFERRAL = 'REFERRAL',
    JOB_PORTAL = 'JOB_PORTAL',
}

export interface ICandidateOffer {
    candidateId: string;
    candidateName: string;
    candidateEmail: string;
    offerStatus: OfferStatus | null;
    offerPosition: string | null;
    offerDepartment: string | null;
    baseSalary: number;
    allowance: number;
    specialAllowance: number;
    totalCompensation: number;
    offerStartDate: string | null;        // ISO format: "2026-04-08"
    probationMonths: number;
    offerApprover: Item
    offerDocumentUrl: string | null;
    offerNotes: string | null;
    offerSentOn: string | null;           // ISO format
}

// Enum cho trạng thái Offer (bạn có thể mở rộng sau)
export enum OfferStatus {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    SENT = "SENT",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED",
    CANCELLED = "CANCELLED"
}

export type CriterionKey = 'professional' | 'attitude' | 'communication' | 'experience';

export interface CriterionConfig {
    key: CriterionKey;
    labelKey: EvaluationLabelKey;
    scoreField: keyof EvaluationFormValues;
    evaluationField: keyof EvaluationFormValues;
    commentField: keyof EvaluationFormValues;
}

export type EvaluationLabelKey =
    | 'candidate.detail.evaluation.professional_knowledge'
    | 'candidate.detail.evaluation.attitude'
    | 'candidate.detail.evaluation.communication'
    | 'candidate.detail.evaluation.experience';