import { createFileRoute } from '@tanstack/react-router';
// Nhúng cái Layout tổng chứa 6 danh mục mà chúng ta đã làm lúc nãy vào đây
import CategoryLayout from '../pages/categories/CategoryLayout.tsx';

// 1. Định nghĩa kiểu dữ liệu (Type) cho tham số Search trên URL để TypeScript không bắt lỗi
type CategorySearch = {
  tab?: string;
};

export const Route = createFileRoute('/hrm-categories')({
  // 2. Bổ sung hàm validateSearch để bắt tham số ?tab= từ thanh địa chỉ trình duyệt
  validateSearch: (search: Record<string, unknown>): CategorySearch => {
    return {
      tab: (search.tab as string) || 'shift', // Mặc định nếu không có tham số sẽ mở tab 'shift'
    };
  },
  component: () => <CategoryLayout />,
});