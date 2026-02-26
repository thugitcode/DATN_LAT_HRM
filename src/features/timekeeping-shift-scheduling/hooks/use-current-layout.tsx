import { useLocation } from '@tanstack/react-router';
import { useLayoutStore } from '@/store/useLayoutStore';

export const useCurrentLayout = () => {
  const { pathname = '/' } = useLocation();
  return useLayoutStore((state) => state.getLayout(pathname));
};
