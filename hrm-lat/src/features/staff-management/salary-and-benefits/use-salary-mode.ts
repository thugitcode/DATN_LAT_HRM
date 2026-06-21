// Store riêng cho tab Lương và phúc lợi
// Tách ra để tránh conflict với store của tab Hợp đồng
import { createControlMode } from './hooks/use-control-mode-handle';

export const useSalaryMode = createControlMode<any>();