import type { Status } from './global.type';

export interface Department {
  id: string;
  code: string;
  name: string;
  note: string | null;
  status: Status;
  createdAt: string;
}
