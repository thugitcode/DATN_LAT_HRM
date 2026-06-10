export enum AllowanceType {
    ALLOWANCE = "ALLOWANCE",
    DEDUCTION = "DEDUCTION"
};

export type PaymentType = "MONTH" | "DAY" | "YEAR";

export type StatusAllowance = "ACTIVE" | "INACTIVE";

export interface Allowance {
    id: string;
    code: string;
    name: string;
    type: AllowanceType;
    paymentType: PaymentType;
    appliedDate: string;
    value: number | null;
    status: StatusAllowance;
}
