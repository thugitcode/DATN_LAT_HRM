import type { Department } from "@/types/deparment.type";
import type { Room } from "@/types/room.type";

export enum RevenueStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
}
export interface RevenueDataListType {
  id: string;
  staff: {
    id: string;
    name: string;
    code: string;
    departments?: any[]; // Thêm nếu có dữ liệu từ API thật
    rooms?: any[];
    position?: string;
  };
  departments: Department[]
  rooms: Room[]
  month: string;
  targetAmount: number;
  actualAmount: number;
  achievementRate: number;
  source: string;
  status: RevenueStatus;
  createdAt: string;
}