/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutSwitcherEnum } from '@/types/global.type';
import { cn } from '@/lib/utils';

import { useCurrentLayout } from '../hooks/use-current-layout';

interface LayoutRendererProps {
  layouts: Record<
    string,
    {
      component: React.ComponentType<any>;
      props?: Record<string, any>;
    }
  >;
  wrapperClassName?: string;
}

export const LayoutRenderer = ({ layouts, wrapperClassName }: LayoutRendererProps) => {
  const currentLayout = useCurrentLayout();
  const layout = layouts[currentLayout];

  if (!layout) return null;

  const { component: Component, props } = layout;
  return (
    <div className={cn(wrapperClassName, currentLayout === LayoutSwitcherEnum.LIST && 'px-6')}>
      <Component {...props} />
    </div>
  );
};
