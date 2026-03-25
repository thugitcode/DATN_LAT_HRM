import { Status } from '@/types/global.type';

import { PayPeriodsCard } from './pay-periods-card';

export interface PayPeriod {
  id: string;
  month: number;
  year: number;
  employeeCount: number;
  totalCost: number;
  status: Status;
}

const mockPayPeriods: PayPeriod[] = [
  {
    id: '1',
    month: 1,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
  {
    id: '2',
    month: 2,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
  {
    id: '3',
    month: 3,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
  {
    id: '4',
    month: 4,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.PENDING,
  },
  {
    id: '5',
    month: 5,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
  {
    id: '6',
    month: 6,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
  {
    id: '7',
    month: 4,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
  {
    id: '8',
    month: 5,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
  {
    id: '9',
    month: 6,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
  {
    id: '10',
    month: 4,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
  {
    id: '11',
    month: 5,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
  {
    id: '12',
    month: 6,
    year: 2024,
    employeeCount: 240,
    totalCost: 240_000_000,
    status: Status.ACTIVE,
  },
];

export const PayPeriodsList = () => {
  return (
    <div className="grid grid-cols-3 gap-3">
      {mockPayPeriods.map((period) => (
        <PayPeriodsCard key={period.id} data={period} />
      ))}
    </div>
  );
};
