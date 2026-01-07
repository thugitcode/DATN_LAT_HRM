import { forwardRef, useImperativeHandle, useState } from 'react';
import { Box, Input, type InputProps, type PolymorphicComponentProps } from '@mantine/core';

import { Icons } from '../icons';

type Props = PolymorphicComponentProps<'input', InputProps> & {
  onSearch?: (value: string) => void;
};

export type FilterSearchRef = {
  reset: () => void;
};

export const FilterSearch = forwardRef<FilterSearchRef, Props>(
  ({ placeholder, onSearch, ...props }, ref) => {
    const [search, setSearch] = useState('');

    useImperativeHandle(ref, () => ({
      reset: () => {
        setSearch('');
      },
    }));

    return (
      <Input
        variant="filled"
        placeholder={placeholder ?? 'Tìm kiếm'}
        value={search}
        radius={10}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.(search)}
        leftSection={<Box component={Icons.search} w={20} />}
        w={250}
        {...props}
      />
    );
  },
);

FilterSearch.displayName = 'FilterSearch';
