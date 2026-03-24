import { createFileRoute } from '@tanstack/react-router';
import { PayrollCalculationDetail } from '@/features/payroll-management/payroll-calculation/payroll-calculation-detail';
import { z } from 'zod';

const searchSchema = z.object({
  staffId: z.string().optional(),
});

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/payroll-calculation/$id',
)({
  validateSearch: searchSchema,
  component: PayrollCalculationDetail,
});
