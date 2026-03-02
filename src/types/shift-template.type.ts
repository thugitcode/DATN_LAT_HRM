export interface ShiftTemplate {
    id: string;
    code: string;
    name: string;
    type: string;
    startTime: string;
    endTime: string;
    coefficient: number;
    standardHours: number;
    color: string;
    allowedLateMinutes: number;
    allowedEarlyLeaveMinutes: number;
    handoverTime: number;
    dutyAllowance: number;
    compensatoryType: string;
    compensatoryCoefficient: number;
    restTimeAfterShift: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface ShiftTemplateParams {
    page?: number;
    limit?: number;
    getAll?: boolean;
    type?: string;
    status?: string;
    search?: string;
    [key: string]: unknown;
}
