import type { FieldApi } from '@tanstack/react-form';
import type { LinkProps } from '@tanstack/react-router';
import type { ComboboxItem } from '@mantine/core';

import type { Icons } from '@/components/icons';

export type FormSelectOptions<T> = FormSelectItem<T>[];

export type FormSelectItem<T> = ComboboxItem & {
  item?: T;
};

export type UseOptionsMeta<TMeta = object> = TMeta;

export type UseOptions<T, TMeta = object> = (meta?: UseOptionsMeta<TMeta>) => {
  options: FormSelectOptions<T>;
  disabled?: boolean;
};

export interface QueryOptionsListResponse<T, R = object> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    page: number;
  };
  meta?: R;
}

export interface MenuItem {
  label: string;
  key: string;
  link: LinkProps['to'];
}

export interface EcosystemMenuItem extends Omit<MenuItem, 'link'> {
  link: string;
  icon: keyof typeof Icons;
}

export interface MainMenuItem extends MenuItem {
  icon: keyof typeof Icons;
  children?: MenuItem[];
}

export interface ApiResponse<T> {
  status?: number;
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPage: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export type FormFieldProps = {
  // @ts-expect-error "Too tired to handle this"
  formProps?: FieldApi;
};

export enum EConfirmType {
  INFO = 'INFO',
  DANGER = 'DANGER',
}
