import { ActionIcon, Flex, Text } from '@mantine/core';
import { IconFileDownload } from '@tabler/icons-react';

import { ACTIONS_TYPE } from '@/types';
import { ButtonCreate } from '@/components/button-create';
import { FilterSearch } from '@/components/filters/filter-search';

import { Icons } from './icons';

interface Props {
  title: string;
  onSearch: (search: string) => void;
  hasDownload?: boolean;
  onDeletes?: () => void;
}
const HeaderTable = ({ title, onSearch, hasDownload, onDeletes }: Props) => {
  return (
    <Flex justify={'space-between'} align={'center'} mb={12}>
      <Text size="20px" fw={500}>
        {title}
      </Text>
      <Flex gap={12} justify={'space-between'} align={'center'}>
        <FilterSearch
          styles={{
            input: { height: 40, background: 'white', border: 'none' },
          }}
          h={40}
          variant="filled"
          onSearch={onSearch}
        />

        {onDeletes && (
          <ActionIcon size={40} p={9} style={{ borderRadius: 10 }} bg={'white'} onClick={onDeletes}>
            <Icons.trash color="#4F5675" />
          </ActionIcon>
        )}
        {hasDownload && (
          <ActionIcon size={40} p={5} style={{ borderRadius: 10 }} bg="white">
            <IconFileDownload size={18} color="#4F5675" />
          </ActionIcon>
        )}
        <ButtonCreate
          w="40"
          h={40}
          radius={10}
          // onClick={() => open({ type: ACTIONS_TYPE.CREATE })}
        />
      </Flex>
    </Flex>
  );
};
export default HeaderTable;
