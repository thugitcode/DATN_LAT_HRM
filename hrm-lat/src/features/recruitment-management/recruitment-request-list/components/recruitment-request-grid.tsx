import type { FC } from 'react';
import { Pagination, Select, SelectItem, Spinner } from '@heroui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';

import type { RecruitmentRequest } from '../types/type';
import { RecruitmentRequestCard } from './recruitment-request-card';
import { TablePagination } from '@/components/table/table-pagination';

interface RecruitmentRequestGridProps {
  data: RecruitmentRequest[];
  isLoading?: boolean;
  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

const PAGE_SIZE_OPTIONS = ['12', '24', '48', '96'];

export const RecruitmentRequestGrid: FC<RecruitmentRequestGridProps> = ({
  data,
  isLoading,
  page = 1,
  limit = 12,
  total = 0,
  onPageChange,
  onLimitChange,
}) => {
  const { t } = useTranslation(NAMESPACES.COMMON);
  const totalPages = Math.ceil((total || 1) / limit);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-396px)]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-396px)] text-[#71717A] text-sm font-medium">
        {t('table.empty')}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-345px)]">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 overflow-y-auto overflow-x-hidden p-1 pr-2 custom-scrollbar"
      >
        {data.map((item) => (
          <motion.div key={item.id} variants={itemVariants}>
            <RecruitmentRequestCard data={item} />
          </motion.div>
        ))}
      </motion.div>

      {/* Pagination */}
      <div className="py-3">
        {/*  <div className="flex items-center gap-2">
          <span className="text-sm text-[#71717A]">Page</span>
          <Select
            size="sm"
            variant="bordered"
            selectedKeys={[limit.toString()]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              if (value) onLimitChange?.(Number(value));
            }}
            className="w-[70px]"
            classNames={{ trigger: 'h-8 min-h-8 rounded-lg' }}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <SelectItem key={s}>{s}</SelectItem>
            ))}
          </Select>
          <span className="text-sm text-[#71717A]">of {totalPages}</span>
        </div>
        <Pagination
          total={totalPages || 1}
          page={page}
          onChange={onPageChange}
          showControls
          size="sm"
          classNames={{ cursor: 'bg-[#6576FF] text-white' }}
        />*/}
        <TablePagination total={totalPages} />
      </div>
    </div>
  );
};

