export interface IRecruitmentPeriod {
  month: number;
  year: number;
  quarter: number;
  fromDate: string;
  toDate: string;
}

export interface IRecruitmentSummary {
  totalRecruitmentRequests: number;
  totalCandidates: number;
  totalInterviewsThisMonth: number;
  offerAcceptanceRate: number;
  inProgressProbationCount: number;
  waitingEvaluationProbationCount: number;
  convertedOfficialCount: number;
  onTimeHiringRate: number;
}

export interface IRecruitmentByDepartmentItem {
  departmentId: string;
  departmentName: string;
  requestedQuantity: number;
}

export interface IRecruitmentByDepartment {
  quarter: number;
  items: IRecruitmentByDepartmentItem[];
}

export interface ICandidateSourceItem {
  source: string;
  count: number;
  percentage: number;
}

export interface ICandidateSource {
  totalCandidates: number;
  items: ICandidateSourceItem[];
}

export interface RecruitmentDashboardParams {
  month: number;
  year: number;
}
