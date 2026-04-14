import type { FC } from 'react';
import { Spinner } from '@heroui/react';
import { motion } from 'framer-motion';

import type { RecruitmentRequest } from '../types/type';
import { RecruitmentRequestCard } from './recruitment-request-card';
import { useTranslation } from 'react-i18next';
import { NAMESPACES } from '@/i18n/constants';

interface RecruitmentRequestGridProps {
  data: RecruitmentRequest[];
  isLoading?: boolean;
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

export const RecruitmentRequestGrid: FC<RecruitmentRequestGridProps> = ({ data, isLoading }) => {
  const { t } = useTranslation(NAMESPACES.COMMON);

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4 overflow-y-auto overflow-x-hidden h-[calc(100vh-345px)] p-1 pr-2 custom-scrollbar"
    >
      {data.map((item) => (
        <motion.div key={item.id} variants={itemVariants}>
          <RecruitmentRequestCard data={item} />
        </motion.div>
      ))}
    </motion.div>
  );
};

