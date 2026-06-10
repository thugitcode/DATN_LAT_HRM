import { Spinner } from '@heroui/react';

export const TableLoading = () => {
  return (
    <div className="sticky left-0 top-0 z-40 h-0" style={{ width: '100vw' }}>
      <div className="absolute inset-0 h-[calc(100vh-304px)] bg-black/10 rounded-lg ">
        <div className="absolute left-1/2 top-1/3">
          <Spinner />
        </div>
      </div>
    </div>
  );
};
