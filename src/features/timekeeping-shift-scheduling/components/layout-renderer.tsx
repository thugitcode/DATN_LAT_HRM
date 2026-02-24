import { LayoutSwitcherEnum } from '@/types/global.type';
import { cn } from '@/lib/utils';

import { useCurrentLayout } from '../hooks/use-current-layout';

interface LayoutRendererProps {
  layouts: Record<string, React.ComponentType>;
  wrapperClassName?: string;
}

export const LayoutRenderer = ({ layouts, wrapperClassName }: LayoutRendererProps) => {
  const currentLayout = useCurrentLayout();
  const Component = layouts[currentLayout];

  if (!Component) return null;

  return (
    <div className={cn(wrapperClassName, currentLayout === LayoutSwitcherEnum.LIST && 'px-6')}>
      <Component />
    </div>
  );
};
