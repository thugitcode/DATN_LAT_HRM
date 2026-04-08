import { DataTable } from '@/components/data-table/data-table';
import type { PaginationConfig } from '@/components/table/types';

import { type ICandidate } from '../../recruitment-request-details/types/type';
import { useCandidateColumns } from '../hooks/use-columns';
import { useNavigate } from '@tanstack/react-router';

interface CandidateListProps {
  candidates: ICandidate[];
  loading?: boolean;
  pagination?: false | PaginationConfig;
}

export function CandidateList({ candidates, loading, pagination }: CandidateListProps) {
  const { columns } = useCandidateColumns();
  const navigate = useNavigate()
  return (
    <DataTable
      columns={columns}
      dataSource={candidates}
      rowKey="id"
      loading={loading}
      selectionMode="none"
      pagination={pagination}
      classNames={{ wrapper: 'rounded-[14px] h-[calc(100vh-275px)]' }}
      onRowClick={(record) => navigate({ to: `/admin/recruitment-management/candidate/${record.id}` })}
    />
  );
}
