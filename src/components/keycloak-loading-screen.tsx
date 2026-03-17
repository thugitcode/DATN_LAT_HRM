import { Spinner } from '@heroui/react';

export const KeycloakLoadingScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <Spinner className="text-white h-16 w-16" />

      <p className="text-xl font-semibold text-gray-800 dark:text-gray-100 text-center mb-2">
        Hệ thống đang xác thực...
      </p>

      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Vui lòng đợi trong giây lát
      </p>
    </div>
  );
};
