export interface ProbationCreatePayload {
  candidateId: string;
  name: string;
  phone: string;
  email: string;
  departmentIds: string[];
  birthday?: string | null;
  gender: string;
  identity?: string | null;
  identityIssueDate?: string | null;
  identityIssuePlace?: string | null;
  nationality?: string | null;
  address?: string | null;
  basicSalary?: string | null;
  salaryType: 'NET' | 'GROSS';
  hasHealthInsurance: boolean;
  hasSocialInsurance: boolean;
  hasUnemploymentInsurance: boolean;
  managedDepartmentId: string;
  managedRoomId?: string | null;
  workType?: string | null;
  jobTitleId: string;
  position: string;
  contractType: string;
  directManagerId: string;
  mentorId: string;
  probationStartDate: string;
  probationMonths: number;
  probationEndDate?: string | null;
  actualStartDate?: string | null;
  probationReviewDate: string;
  qualification: string;
  major?: string | null;
  academicTitle?: string | null;
  certificateNumber?: string | null;
  certificateIssuePlace?: string | null;
  certificateExpiryDate?: string | null;
  onboardingDocumentsCompleted: boolean;
  onboardingDocumentsNote?: string | null;
  onboardingContractSigned: boolean;
  onboardingContractNote?: string | null;
  onboardingSystemAccountCreated: boolean;
  onboardingSystemAccountNote?: string | null;
  onboardingStaffCardIssued: boolean;
  onboardingStaffCardNote?: string | null;
  onboardingUniformIssued: boolean;
  onboardingUniformNote?: string | null;
  onboardingOrientationCompleted: boolean;
  onboardingOrientationNote?: string | null;
  probationWorkObjectives?: string | null;
  note?: string | null;
}

export interface ProbationFilters {
  search?: string;
  jobTitleId?: string;
  departmentId?: string;
  roomId?: string;
  status?: string;
  page?: string;
  limit?: string;
  [key: string]: unknown;
}

export interface ProbationItem {
  id: string;
  code: string;
  name: string;
  jobTitle: { id: string; name: string } | null;
  department: { id: string; name: string } | null;
  room: { id: string; name: string } | null;
  probationStartDate: string;
  probationEndDate: string;
  probationReviewRound: string;
  evaluator: { id: string; name: string } | null;
  probationProposal: string | null;
  displayProbationStatus: ProbationStatusEnum;
  hasEvaluation: boolean;
  isOverdue: boolean;
}

export enum ProbationStatusEnum {
  WAITING_FOR_ACCEPTANCE = 'WAITING_FOR_ACCEPTANCE',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_FOR_EVALUATION = 'WAITING_FOR_EVALUATION',
  PASS = 'PASS',
  EXTENDED = 'EXTENDED',
  FAIL = 'FAIL',
  OFFICIALLY_ACCEPTED = 'OFFICIALLY_ACCEPTED',
}

export enum ProbationEvaluationResultEnum {
  PASS = 'PASS',
  FAIL = 'FAIL',
}

export enum ProbationEvaluationDecisionEnum {
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  EXTENDED = 'EXTENDED',
  REJECTED = 'REJECTED',
}

export interface ProbationEvaluationPayload {
  reviewerId?: string;
  approverId?: string;
  templateName?: string;
  roundLabel?: string;
  evaluationStartDate?: string;
  evaluationEndDate?: string;
  evaluationDate?: string;
  professionalScore?: number;
  attitudeScore?: number;
  communicationScore?: number;
  generalComment?: string;
  strengths?: string;
  improvementAreas?: string;
  reviewerComment?: string;
  approverComment?: string;
  decision?: ProbationEvaluationDecisionEnum;
  isFinal?: boolean;
}

export interface ProbationEvaluation {
  id: string;
  round: number;
  type: string;
  date: string;
  evaluator: { id: string; name: string } | null;
  professionalScore: number | null;
  performanceScore: number | null;
  attitudeScore: number | null;
  totalScore: number | null;
  result: ProbationEvaluationResultEnum | null;
}
