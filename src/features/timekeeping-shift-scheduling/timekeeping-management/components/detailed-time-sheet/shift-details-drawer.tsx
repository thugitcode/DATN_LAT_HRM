/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { NAMESPACES } from '@/i18n/constants';
import { useDrawer } from '@/store/useDrawer';
import {
  Accordion,
  AccordionItem,
  addToast,
  Button,
  Form,
  Image,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconCaretRightFilled } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { RequestsParams } from '@/types/global.type';
import { usePeriodStatus } from '@/hooks/use-period-status';
import { useQueryFilter } from '@/hooks/useQueryFilter';
import { FormArea } from '@/components/form-fields/form-area';
import { LoadingWrapper } from '@/components/loading-wrapper';
import { displayTime } from '@/features/timekeeping-shift-scheduling/helper';
import { ShiftDetailsCard } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/detailed-time-sheet/shift-details-card';

import {
  useAttendanceDetail,
  useUpdateAttendanceMutation,
} from '../../hooks/use-timekeeping-management';
import {
  shiftDetailsSchema,
  type shiftDetailsFormValues,
} from '../../schemas/shift-details.schema';
import { CheckInMethodEnum } from './type';

export const ShiftDetailsDrawer = () => {
  const { t } = useTranslation(NAMESPACES.TIMEKEEPING_SHIFT_SCHEDULING);
  const { t: tc } = useTranslation(NAMESPACES.COMMON);

  const columns = [
    { key: 'changedByName', label: t('shift_details.columns.adjusted_by') },
    { key: 'adjustedTime', label: t('shift_details.columns.adjusted_time') },
    { key: 'reason', label: t('shift_details.columns.reason') },
  ];

  const closedDrawer = useDrawer((state) => state.onClose);
  const workScheduleDetailId = useDrawer((state) => state.data) as string;

  const { data, isLoading, refetch } = useAttendanceDetail(workScheduleDetailId);
  const { mutate: updateAttendance } = useUpdateAttendanceMutation();

  const { filters } = useQueryFilter<RequestsParams>();

  const monthQuery = dayjs(filters.month ?? undefined).format('YYYY-MM');

  const { isLocked, isDraff, isPublished, isLock } = usePeriodStatus(monthQuery);

  const detailData = data?.data;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, dirtyFields },
    reset,
  } = useForm<shiftDetailsFormValues>({
    resolver: zodResolver(shiftDetailsSchema),
    defaultValues: { reason: '', actualCheckIn: '', actualCheckOut: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    reset({
      reason: '',
      actualCheckIn: detailData?.attendance?.checkInTime ?? '',
      actualCheckOut: detailData?.attendance?.checkOutTime ?? '',
    });
  }, [detailData]);

  const onSubmit = async (values: any) => {
    if (!dirtyFields.actualCheckIn && !dirtyFields.actualCheckOut) {
      return addToast({
        description: t('shift_details.toast.no_changes'),
        color: 'warning',
      });
    }

    const newValues = {
      ...values,
      actualCheckIn: dayjs(values.actualCheckIn, 'HH:mm').format('HH:mm:ss'),
      actualCheckOut: dayjs(values.actualCheckOut, 'HH:mm').format('HH:mm:ss'),
      id: detailData?.id ?? null,
    };

    updateAttendance(newValues, {
      onSuccess: () => {
        addToast({
          description: t('shift_details.toast.update_success'),
          color: 'success',
        });
        reset();
        refetch();
      },
      onError() {
        addToast({
          description: t('shift_details.toast.update_error'),
          color: 'danger',
        });
      },
    });
  };

  return (
    <LoadingWrapper isLoading={isLoading}>
      <Form
        className="h-full gap-2 flex flex-col"
        validationBehavior="aria"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="bg-white w-full p-4 gap-3 flex flex-col">
          <ShiftDetailsCard shift={detailData} control={control} />

          {detailData?.attendance.checkInMethod === CheckInMethodEnum.BIOMETRIC && (
            <div className="flex gap-3">
              <div className="flex flex-col gap-3">
                <div className="font-medium">{t('shift_details.face_id.check_in')}</div>
                {detailData?.attendance.checkInImage ? (
                  <Image
                    alt={t('shift_details.face_id.check_in')}
                    src={detailData.attendance.checkInImage}
                    width={183}
                    height={183}
                    isZoomed
                  />
                ) : (
                  <div className="w-45.75 h-45.75 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    {t('shift_details.face_id.no_image')}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-3">
                <div className="font-medium">{t('shift_details.face_id.check_out')}</div>
                {detailData?.attendance.checkOutImage ? (
                  <Image
                    alt={t('shift_details.face_id.check_out')}
                    src={detailData.attendance.checkOutImage}
                    width={183}
                    height={183}
                    isZoomed
                  />
                ) : (
                  <div className="w-45.75 h-45.75 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                    {t('shift_details.face_id.no_image')}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 w-full">
          <div className="bg-white rounded-xl p-3 size-full space-y-3 overflow-auto">
            <FormArea
              control={control}
              name="reason"
              label={t('shift_details.reason_label')}
              isRequired
              disabled={isSubmitting}
              maxRows={16}
              classNames={{ label: 'text-base font-normal leading-4 text-[#52525B] mb-3' }}
            />
          </div>
        </div>

        <div className="px-4 py-0 w-full mb-17.5">
          <Accordion selectionMode="multiple" className="px-0 w-full">
            <AccordionItem
              classNames={{
                title: 'text-2xl font-medium leading-[32px]',
                trigger: 'flex-row-reverse pt-0 gap-3',
                indicator: 'data-[open=true]:!rotate-90 text-black',
              }}
              key="LICH_SU_DIEU_CHINH"
              aria-label={t('shift_details.history.title')}
              title={t('shift_details.history.title')}
              indicator={<IconCaretRightFilled />}
            >
              <Table
                aria-label={t('shift_details.history.title')}
                classNames={{ wrapper: 'mb-17.5' }}
              >
                <TableHeader columns={columns}>
                  {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
                </TableHeader>
                <TableBody
                  items={detailData?.histories ?? []}
                  emptyContent={t('shift_details.history.empty')}
                >
                  {(item) => (
                    <TableRow key={item?.id}>
                      <TableCell>{item?.changedByName}</TableCell>
                      <TableCell>
                        {displayTime(item.oldTime)} → {displayTime(item.newTime)}
                      </TableCell>
                      <TableCell>{item?.reason}</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="flex justify-end gap-2 py-3 px-6 bg-white w-full absolute bottom-0">
          <Button
            variant="light"
            onPress={closedDrawer}
            className="border-[#6576FF] border bg-white text-[#6576FF] text-[14px] font-normal"
          >
            {tc('button.cancel')}
          </Button>

          {!isLock && (
            <Button type="submit" color="primary" isLoading={isSubmitting}>
              {tc('button.update')}
            </Button>
          )}
        </div>
      </Form>
    </LoadingWrapper>
  );
};
