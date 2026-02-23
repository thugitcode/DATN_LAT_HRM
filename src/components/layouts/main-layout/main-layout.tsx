import { type FC, type ReactNode } from 'react';

import { MainHeader } from './main-header';
import { MainSidebar } from './main-sidebar/main-sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: FC<Readonly<MainLayoutProps>> = ({ children }) => {
  return (
    <div className="h-full flex flex-col">
      <MainHeader />

      <div className="flex flex-1">
        <MainSidebar />

        <div className="bg-[#F4F4F5] flex-1 size-full relative min-w-0">{children}</div>
      </div>
    </div>
  );
};
