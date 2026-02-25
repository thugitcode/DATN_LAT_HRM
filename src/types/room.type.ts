import type { Status } from './global.type';

export interface Department {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  note: string | null;
  status: Status;
  department: Department;
  createdAt: string;
}
