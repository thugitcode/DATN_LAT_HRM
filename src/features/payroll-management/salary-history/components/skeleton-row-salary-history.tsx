export const SkeletonRowSalaryHistory = () => (
  <div className="grid grid-cols-[140px_1fr] gap-4 py-4 border-b border-gray-100 animate-pulse">
    <div className="space-y-2">
      <div className="h-3.5 w-24 bg-gray-100 rounded" />
      <div className="h-3 w-20 bg-gray-100 rounded" />
    </div>
    <div className="space-y-2">
      <div className="h-3.5 w-48 bg-gray-100 rounded" />
      <div className="h-3 w-64 bg-gray-100 rounded" />
      <div className="h-3 w-40 bg-gray-100 rounded" />
    </div>
  </div>
);
