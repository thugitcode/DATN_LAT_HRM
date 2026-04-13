import type { FC } from 'react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { IconDots } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

import { NAMESPACES } from '@/i18n/constants';
import { DrawerType, useDrawer } from '@/store/useDrawer';
import {
  useProbationCancelAcceptance,
  useProbationEnd,
  useProbationEndEarly,
  useProbationEvaluate,
  useProbationExtend,
  useProbationResendInvitation,
  useProbationUpdateExtension,
} from '../hooks/use-probation-list';
import { ProbationStatusEnum, type ProbationItem } from '../types/probation.type';

interface RowProbationActionsProps {
  dataRow: ProbationItem;
}

const BTN_BASE = 'rounded-xl font-medium h-9 min-w-[120px] text-sm';

function ProbationActionButton({ dataRow }: { dataRow: ProbationItem }) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);
  const { onOpen } = useDrawer();

  const { mutate: resendInvitation, isPending: isResending } = useProbationResendInvitation();
  const { mutate: evaluate, isPending: isEvaluating } = useProbationEvaluate();
  const { mutate: updateExtension, isPending: isUpdating } = useProbationUpdateExtension();
  const { mutate: endProbation, isPending: isEnding } = useProbationEnd();

  switch (dataRow.displayProbationStatus) {
    case ProbationStatusEnum.WAITING_FOR_ACCEPTANCE:
      return (
        <Button
          variant="bordered"
          color="primary"
          className={BTN_BASE}
          isLoading={isResending}
          onPress={() => resendInvitation(dataRow.id)}
        >
          {t('probation.actions.resend_invitation')}
        </Button>
      );

    case ProbationStatusEnum.IN_PROGRESS:
    case ProbationStatusEnum.WAITING_FOR_EVALUATION:
      return (
        <Button
          color="primary"
          className={BTN_BASE}
          isLoading={isEvaluating}
          onPress={() => evaluate(dataRow.id)}
        >
          {t('probation.actions.evaluate')}
        </Button>
      );

    case ProbationStatusEnum.PASS:
      return (
        <Button
          color="primary"
          className={BTN_BASE}
          onPress={() =>
            onOpen(DrawerType.PROBATION_ACCEPT, {
              probationId: dataRow.id,
              employeeCode: dataRow.code,
              employeeName: dataRow.name,
              jobTitleName: dataRow.jobTitle?.name,
            })
          }
        >
          {t('probation.actions.accept_official')}
        </Button>
      );

    case ProbationStatusEnum.EXTENDED:
      return (
        <Button
          variant="bordered"
          color="primary"
          className={BTN_BASE}
          isLoading={isUpdating}
          onPress={() => updateExtension(dataRow.id)}
        >
          {t('probation.actions.update_extension')}
        </Button>
      );

    case ProbationStatusEnum.FAIL:
      return (
        <Button
          variant="bordered"
          color="danger"
          className={BTN_BASE}
          isLoading={isEnding}
          onPress={() => endProbation(dataRow.id)}
        >
          {t('probation.actions.end_probation')}
        </Button>
      );

    case ProbationStatusEnum.OFFICIALLY_ACCEPTED:
      return (
        <Button variant="bordered" color="primary" className={BTN_BASE}>
          {t('probation.actions.view_profile')}
        </Button>
      );

    default:
      return null;
  }
}

function ProbationActionDropdown({ dataRow }: { dataRow: ProbationItem }) {
  const { t } = useTranslation(NAMESPACES.RECRUITMENT_MANAGEMENT);

  const { mutate: cancelAcceptance } = useProbationCancelAcceptance();
  const { mutate: extend } = useProbationExtend();
  const { mutate: endEarly } = useProbationEndEarly();

  const getDropdownItems = (): { key: string; label: string; onPress?: () => void; color?: 'danger' }[] => {
    switch (dataRow.displayProbationStatus) {
      case ProbationStatusEnum.WAITING_FOR_ACCEPTANCE:
        return [
          { key: 'cancel_acceptance', label: t('probation.actions.cancel_acceptance'), color: 'danger', onPress: () => cancelAcceptance(dataRow.id) },
        ];

      case ProbationStatusEnum.IN_PROGRESS:
      case ProbationStatusEnum.WAITING_FOR_EVALUATION:
        return [
          { key: 'extend', label: t('probation.actions.extend'), onPress: () => extend(dataRow.id) },
          { key: 'end_early', label: t('probation.actions.end_early'), color: 'danger', onPress: () => endEarly(dataRow.id) },
        ];

      default:
        return [];
    }
  };

  const items = getDropdownItems();
  if (items.length === 0) return null;

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          isIconOnly
          variant="light"
          className="rounded-lg h-8 w-8 min-w-8"
          onPress={(e) => e.continuePropagation()}
        >
          <IconDots size={18} color="#71717A" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="probation actions">
        {items.map((item) => (
          <DropdownItem
            key={item.key}
            color={item.color}
            className={item.color === 'danger' ? 'text-danger' : ''}
            onPress={() => item.onPress?.()}
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

export const RowProbationActions: FC<RowProbationActionsProps> = ({ dataRow }) => {
  return (
    <div
      className="flex items-center justify-end gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <ProbationActionButton dataRow={dataRow} />
      <ProbationActionDropdown dataRow={dataRow} />
    </div>
  );
};
