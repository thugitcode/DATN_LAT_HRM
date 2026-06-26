import { createFileRoute } from '@tanstack/react-router';
import { UserPayslip } from '@/features/user/payslip/user-payslip';
export const Route = createFileRoute('/_private/user/_dashboard/payslip')({
  component: UserPayslip,
});