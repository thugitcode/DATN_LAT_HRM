import { DataTable } from '@/components/data-table/data-table';
import type { PaginationConfig } from '@/components/table/types';

import { type Candidate } from '../../recruitment-request-details/types/type';
import { useCandidateColumns } from '../hooks/use-columns';

interface CandidateListProps {
  candidates: Candidate[];
  loading?: boolean;
  pagination?: false | PaginationConfig;
}

export function CandidateList({ candidates, loading, pagination }: CandidateListProps) {
  const { columns } = useCandidateColumns();

  return (
    <DataTable
      columns={columns}
      dataSource={candidates}
      rowKey="id"
      loading={loading}
      selectionMode="none"
      pagination={pagination}
      classNames={{ wrapper: 'rounded-[14px] h-[calc(100vh-275px)]' }}
    />
  );
}
