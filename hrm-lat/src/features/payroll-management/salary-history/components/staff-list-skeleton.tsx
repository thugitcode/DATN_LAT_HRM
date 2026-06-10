export const StaffListSkeleton = () => (
  <div className="w-58 h-[90%] space-y-1">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="rounded-[14px] flex items-center gap-2 px-2.5 py-3 bg-gray-100 animate-pulse"
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-2.5 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
