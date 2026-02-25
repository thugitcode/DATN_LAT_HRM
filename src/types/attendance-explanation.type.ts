export enum AttendanceExplanationStatus {
    PENDING = 'PENDING',
    PENDING_HR = 'PENDING_HR',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
}

export enum AttendanceExplanationType {
    LATE = 'LATE',
    EARLY_LEAVE = 'EARLY_LEAVE',
    MISSING_CHECK_IN = 'MISSING_CHECK_IN',
    MISSING_CHECK_OUT = 'MISSING_CHECK_OUT',
    ABSENT = 'ABSENT',
    MISSING_HOURS = 'MISSING_HOURS',
    BUSINESS_TRIP = 'BUSINESS_TRIP',
    SICK = 'SICK',
    OTHER = 'OTHER',
}

export interface AttendanceExplanation {
    id: string;
    staffId: string;
    staffCode: string;
    staffName: string;
    departmentName: string;
    roomName: string;
    position: string;
    date: string;
    type: AttendanceExplanationType;
    typeLabel: string;
    reason: string;
    attachmentCount: number;
    firstAttachmentName: string;
    approvedByManagerName: string;
    status: AttendanceExplanationStatus;
    createdAt: string;
}

export interface AttendanceExplanationTypeCount {
    type: AttendanceExplanationType;
    label: string;
    count: number;
}

export interface AttendanceExplanationSummary {
    totalRequests: number;
    pending: number;
    approved: number;
    rejected: number;
    byType: AttendanceExplanationTypeCount[];
}

export interface AttendanceExplanationFilters {
    fromDate?: string;
    toDate?: string;
    departmentId?: string;
    roomId?: string;
    status?: AttendanceExplanationStatus;
    type?: AttendanceExplanationType;
    search?: string;
}

export interface AttendanceExplanationListResponse {
    data: AttendanceExplanation[];
    pagination: {
        total: number;
        page: number;
        limit: number;
    };
    metadata: AttendanceExplanationSummary;
}
