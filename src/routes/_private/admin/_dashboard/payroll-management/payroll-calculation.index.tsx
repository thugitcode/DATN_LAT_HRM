import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { PayrollCalculation } from '@/features/payroll-management/payroll-calculation/payroll-calculation';

const searchSchema = z.object({
  month: z.string().optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  search: z.string().optional(),
  departmentId: z.string().optional(),
  roomId: z.string().optional(),
  status: z.string().optional(),
});

export const Route = createFileRoute(
  '/_private/admin/_dashboard/payroll-management/payroll-calculation/',
)({
  validateSearch: searchSchema,
  component: PayrollCalculation,
});
