import { createFileRoute } from '@tanstack/react-router';
// Nhúng cái Layout tổng chứa 6 danh mục mà chúng ta đã làm lúc nãy vào đây
import CategoryLayout from '../pages/categories/CategoryLayout.tsx';

export const Route = createFileRoute('/hrm-categories')({
  component: () => <CategoryLayout />,
});