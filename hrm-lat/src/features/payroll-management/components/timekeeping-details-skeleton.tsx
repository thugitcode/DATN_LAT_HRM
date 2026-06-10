import { Skeleton } from '@heroui/react';

const SKELETON_ROWS = 4;

export const TimekeepingDetailSkeleton = () => (
    <Skeleton className="rounded-b-lg p-4 space-y-2">
        {Array.from({ length: SKELETON_ROWS }, (_, i) => (
            <Skeleton key={i} className="rounded-lg h-40 bg-white" />
        ))}
    </Skeleton>
);
