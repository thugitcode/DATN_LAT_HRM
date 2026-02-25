import { Spinner } from '@heroui/react';

export const TableLoading = () => {
  return (
    <div className="absolute size-full left-0 right-0 top-0 z-40 bottom-0 bg-black/10 rounded-lg flex items-center justify-center">
      <Spinner />
    </div>
  );
};
