import { type FC, type ReactNode } from 'react';

import { MainHeader } from './main-header';
import { MainSidebar } from './main-sidebar/main-sidebar';
import { RightMenu } from './right-menu/right-menu';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout: FC<Readonly<MainLayoutProps>> = ({ children }) => {
  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex flex-1 overflow-hidden min-h-0">
        <MainSidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <MainHeader />
          <div className="flex-1 flex min-w-0 min-h-0">
            <div className="bg-[#F4F4F5] flex-1 min-w-0 min-h-0 relative overflow-y-auto">{children}</div>
            <RightMenu />
          </div>
        </div>
      </div>
    </div>
  );
};