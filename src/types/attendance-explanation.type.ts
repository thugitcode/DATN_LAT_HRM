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

export interface AttachmentResponse {
    id: string;
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
}

export interface AttendanceExplanation {
    id: string;

    // Staff info
    staffId: string;
    staffCode: string;
    staffName: string;
    staffAvatar?: string;
    departmentName: string;
    roomName: string;
    position: string;

    // Shift info (snapshot)
    shiftName?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    date: string;
    dateLabel?: string;
    type: AttendanceExplanationType;
    typeLabel: string;

    // Actual time (snapshot)
    actualCheckIn?: string;
    actualCheckOut?: string;
    totalWorkHours?: string;
    totalActualWorkingHours?: string;
    isCheckInLate?: boolean;
    isCheckOutEarly?: boolean;

    // Explanation content
    reason: string;
    managerConfirmation?: string;
    attachments?: AttachmentResponse[];
    attachmentCount: number;
    firstAttachmentName: string;

    // HR input
    hrComment?: string;

    // Approval info
    approvedByManagerId?: string;
    approvedByManagerName?: string;
    managerName?: string;
    managerApprovedAt?: string;
    approvedByHrId?: string;
    approvedByHrName?: string;
    hrApprovedAt?: string;

    // Status
    status: AttendanceExplanationStatus;
    rejectedById?: string;
    rejectedByName?: string;
    rejectedReason?: string;
    rejectedAt?: string;

    createdAt: string;
    updatedAt?: string;
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
