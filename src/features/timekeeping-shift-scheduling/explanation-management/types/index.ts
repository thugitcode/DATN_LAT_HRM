export interface ExplanationRecord {
    id: string;
    departmentName: string;
    employeeCode: string;
    employeeName: string;
    position: string;
    date: string;
    errorType: string;
    explanation: string;
    attachmentName: string;
    approverName: string;
    status: 'pending' | 'approved' | 'rejected';
}

export interface ExplanationSummary {
    totalRequests: number;
    approved: number;
    rejected: number;
    pending: number;
}

export interface ExplanationTypeCount {
    label: string;
    count: number;
}
