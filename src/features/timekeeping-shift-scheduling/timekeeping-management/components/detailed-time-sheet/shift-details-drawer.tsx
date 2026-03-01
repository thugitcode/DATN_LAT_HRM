/* eslint-disable @typescript-eslint/no-explicit-any */
import { useDrawer } from '@/store/useDrawer';
import {
  Accordion,
  AccordionItem,
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
import { useForm } from 'react-hook-form';

import { AttendanceExplanationType } from '@/types/attendance-explanation.type';
import { FormArea } from '@/components/form-fields/form-area';
import { ShiftDetailsCard } from '@/features/timekeeping-shift-scheduling/timekeeping-management/components/detailed-time-sheet/shift-details-card';

import { useAttendanceDetail } from '../../hooks/use-timekeeping-management';
import {
  shiftDetailsSchema,
  type shiftDetailsFormValues,
} from '../../schemas/shift-details.schema';

const columns = [
  { key: 'createdBy', label: 'NGƯỜI ĐIỀU CHỈNH' },
  { key: 'adjustedTime', label: 'GIỜ ĐIỀU CHỈNH' },
  { key: 'reason', label: 'LÝ DO ĐIỀU CHỈNH' },
];

export const ShiftDetailsDrawer = () => {
  const closedDrawer = useDrawer((state) => state.onClose);

  const workScheduleDetailId = useDrawer((state) => state.data) as string;

  const { data, isLoading } = useAttendanceDetail(workScheduleDetailId);

  const detailData = data?.data;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm<shiftDetailsFormValues>({
    resolver: zodResolver(shiftDetailsSchema),
    defaultValues: {
      reason: '',
      actualCheckIn: '',
      actualCheckOut: '',
      // faceIdCheckIn: undefined,
      // faceIdCheckOut: undefined,
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: any) => {
    console.log('values', values);
  };
  return (
    <Form
      className="h-full gap-2 flex flex-col"
      validationBehavior="aria"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="bg-white w-full p-4 gap-3 flex flex-col">
        <ShiftDetailsCard shift={detailData} control={control} />

        <div className="flex gap-3">
          <div className="flex flex-col gap-3">
            <div className="font-medium">FaceID check in</div>
            {detailData?.attendance.checkInImage ? (
              <Image
                alt="FaceID check in"
                src={detailData.attendance.checkInImage}
                width={183}
                height={183}
                isZoomed
              />
            ) : (
              <div className="w-45.75 h-45.75 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                Không có ảnh
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <div className="font-medium">FaceID check out</div>
            {detailData?.attendance.checkOutImage ? (
              <Image
                alt="FaceID check out"
                src={detailData.attendance.checkOutImage}
                width={183}
                height={183}
                isZoomed
              />
            ) : (
              <div className="w-45.75 h-45.75 rounded-xl bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                Không có ảnh
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 w-full">
        <div className="bg-white rounded-xl p-3 size-full space-y-3 overflow-auto ">
          <FormArea
            control={control}
            name={'reason'}
            label="Lý do điều chỉnh"
            // isRequired
            disabled={isSubmitting}
            maxRows={16}
            classNames={{ label: 'text-base font-normal leading-4 text-[#52525B] mb-3' }}
          />
        </div>
      </div>

      <div className="px-4 py-0 w-full">
        <Accordion selectionMode="multiple" className="px-0 w-full">
          <AccordionItem
            classNames={{
              title: 'text-2xl font-medium leading-[32px]',
              trigger: 'flex-row-reverse pt-0 gap-3',
              indicator: 'data-[open=true]:!rotate-90 text-black',
            }}
            key="1"
            aria-label="Lịch sử điều chỉnh"
            title="Lịch sử điều chỉnh"
            indicator={<IconCaretRightFilled />}
          >
            <Table aria-label="Lịch sử điều chỉnh">
              <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
              </TableHeader>
              <TableBody
                items={detailData?.histories ?? []}
                emptyContent="Không có lịch sử điều chỉnh"
              >
                {(item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.createdBy}</TableCell>
                    <TableCell>
                      {item.checkInTime} → {item.checkOutTime}
                    </TableCell>
                    <TableCell>{item.reason}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="flex justify-end gap-2 pt-3 pb-6 px-6 bg-white w-full">
        <Button
          variant="light"
          onPress={closedDrawer}
          className="border-[#006FEE] border bg-white text-[#006FEE] text-[14px] font-normal"
        >
          Hủy
        </Button>
        <Button type="submit" color="primary" isLoading={isSubmitting}>
          Cập nhật
        </Button>
      </div>
    </Form>
  );
};
