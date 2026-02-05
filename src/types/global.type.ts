import type { ReactNode } from 'react';
import type { LinkProps } from '@tanstack/react-router';

export type GlobalSearchParams = {
  jwt?: string | null;
};

export interface MenuItem {
  label: string;
  path: LinkProps['to'];
  id: string;
  icon?: ReactNode;
}

export enum LayoutSwitcherEnum {
  LIST = 'LIST',
  GRID = 'GRID',
}
