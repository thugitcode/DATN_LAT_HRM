import { type FC, type ReactNode } from 'react';

import { MainSidebar } from './main-sidebar/main-sidebar';
import { RightMenu } from './right-menu/right-menu';

interface DetailsPageLayoutProps {
  children: ReactNode;
}

export const DetailsPageLayout: FC<Readonly<DetailsPageLayoutProps>> = ({ children }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <MainSidebar />
        <div className="flex-1 flex min-w-0">
          <div className="bg-[#F4F4F5] flex-1 size-full relative min-w-0">{children}</div>
          <RightMenu />
        </div>
      </div>
    </div>
  );
};
