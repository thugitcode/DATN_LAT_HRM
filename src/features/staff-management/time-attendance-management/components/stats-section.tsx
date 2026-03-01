import { Button } from '@heroui/react';
import { Tab, Tabs } from '@heroui/tabs';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import dayjs from 'dayjs';

import type { TAB_KEYS } from '../contants/data';
import { useTimeAttendanceTabs } from '../hooks/use-time-attendance-tabs';
import AttendanceSummary from './attendance-summary';

export const StatsSection = () => {
  const { tabs, activeKey, activeTab, setActiveKey } = useTimeAttendanceTabs();
  const data: any = [
    {
      date: '2026-03-01',
      dayOfWeek: 0,
      hours: 0,
      status: 'OFF',
      departments: ['Khoa Nội'],
      position: 'HEAD_OF_DEPARTMENT',
      rooms: ['Phòng 301'],
      staffAvatar: null,
      staffCode: 'BS001',
      staffId: '424fec3d-7f60-4041-9346-fb1a64d168fb',
      staffName: 'Nguyễn Văn Tú',
      standardHours: 0,
      totalHours: 0,
    },
    {
      date: '2026-03-02',
      dayOfWeek: 1,
      hours: 9.5,
      status: 'OT',
      departments: ['Khoa Nội'],
      position: 'HEAD_OF_DEPARTMENT',
      rooms: ['Phòng 301', 'Phòng 302'],
      staffAvatar: null,
      staffCode: 'BS001',
      staffId: '424fec3d-7f60-4041-9346-fb1a64d168fb',
      staffName: 'Nguyễn Văn Tú',
      standardHours: 8,
      totalHours: 10.2,
    },
    {
      date: '2026-03-03',
      dayOfWeek: 2,
      hours: 6.8,
      status: 'LATE',
      departments: ['Khoa Nội'],
      position: 'HEAD_OF_DEPARTMENT',
      rooms: ['Phòng 301'],
      staffAvatar: null,
      staffCode: 'BS001',
      staffId: '424fec3d-7f60-4041-9346-fb1a64d168fb',
      staffName: 'Nguyễn Văn Tú',
      standardHours: 8,
      totalHours: 7.0,
    },
    {
      date: '2026-03-04',
      dayOfWeek: 3,
      hours: 0,
      status: 'LEAVE',
      departments: ['Khoa Nội'],
      position: 'HEAD_OF_DEPARTMENT',
      rooms: [],
      staffAvatar: null,
      staffCode: 'BS001',
      staffId: '424fec3d-7f60-4041-9346-fb1a64d168fb',
      staffName: 'Nguyễn Văn Tú',
      standardHours: 8,
      totalHours: 0,
    },
    {
      date: '2026-03-05',
      dayOfWeek: 4,
      hours: 8.0,
      status: 'PRESENT',
      departments: ['Khoa Nội'],
      position: 'HEAD_OF_DEPARTMENT',
      rooms: ['Phòng 301'],
      staffAvatar: null,
      staffCode: 'BS001',
      staffId: '424fec3d-7f60-4041-9346-fb1a64d168fb',
      staffName: 'Nguyễn Văn Tú',
      standardHours: 8,
      totalHours: 8.5,
    },
    {
      date: '2026-03-06',
      dayOfWeek: 5,
      hours: 7.1,
      status: 'EARLY_LEAVE',
      departments: ['Khoa Nội'],
      position: 'HEAD_OF_DEPARTMENT',
      rooms: ['Phòng 302'],
      staffAvatar: null,
      staffCode: 'BS001',
      staffId: '424fec3d-7f60-4041-9346-fb1a64d168fb',
      staffName: 'Nguyễn Văn Tú',
      standardHours: 8,
      totalHours: 7.1,
    },
    {
      date: '2026-03-07',
      dayOfWeek: 6,
      hours: 10.5,
      status: 'OT',
      departments: ['Khoa Nội'],
      position: 'HEAD_OF_DEPARTMENT',
      rooms: ['Phòng 301'],
      staffAvatar: null,
      staffCode: 'BS001',
      staffId: '424fec3d-7f60-4041-9346-fb1a64d168fb',
      staffName: 'Nguyễn Văn Tú',
      standardHours: 8,
      totalHours: 11.0,
    },
    {
      date: '2026-03-08',
      dayOfWeek: 0,
      hours: 0,
      status: 'OFF',
      departments: ['Khoa Nội'],
      position: 'HEAD_OF_DEPARTMENT',
      rooms: [],
      staffAvatar: null,
      staffCode: 'BS001',
      staffId: '424fec3d-7f60-4041-9346-fb1a64d168fb',
      staffName: 'Nguyễn Văn Tú',
      standardHours: 0,
      totalHours: 0,
    },
    {
      date: '2026-03-09',
      dayOfWeek: 1,
      hours: 0,
      status: 'ABSENT',
      departments: ['Khoa Nội'],
      position: 'HEAD_OF_DEPARTMENT',
      rooms: [],
      staffAvatar: null,
      staffCode: 'BS001',
      staffId: '424fec3d-7f60-4041-9346-fb1a64d168fb',
      staffName: 'Nguyễn Văn Tú',
      standardHours: 0,
      totalHours: 0,
    },
    // Tiếp tục pattern cho các ngày sau (10-31/3): xen kẽ PRESENT, LATE 2-3 lần, OT 3-4 lần, LEAVE 1-2 lần, EARLY_LEAVE 1 lần, ABSENT 1 lần, OFF cuối tuần

    // Nhân viên khác (ví dụ)
    {
      date: '2026-03-01',
      dayOfWeek: 0,
      hours: 0,
      status: 'OFF',
      departments: ['Khoa Ngoại'],
      position: 'SPECIALIST',
      rooms: ['Phòng mổ 2'],
      staffAvatar: null,
      staffCode: 'BS102',
      staffId: '550e8400-e29b-41d4-a716-446655440102',
      staffName: 'Trần Thị Lan',
      standardHours: 0,
      totalHours: 0,
    },
    {
      date: '2026-03-02',
      dayOfWeek: 1,
      hours: 8.0,
      status: 'PRESENT',
      departments: ['Khoa Ngoại'],
      position: 'SPECIALIST',
      rooms: ['Phòng mổ 2'],
      staffAvatar: null,
      staffCode: 'BS102',
      staffId: '550e8400-e29b-41d4-a716-446655440102',
      staffName: 'Trần Thị Lan',
      standardHours: 8,
      totalHours: 8.3,
    },
    {
      date: '2026-03-03',
      dayOfWeek: 2,
      hours: 0,
      status: 'FORGOT_CHECKIN',
      departments: ['Khoa Ngoại'],
      position: 'SPECIALIST',
      rooms: [],
      staffAvatar: null,
      staffCode: 'BS102',
      staffId: '550e8400-e29b-41d4-a716-446655440102',
      staffName: 'Trần Thị Lan',
      standardHours: 8,
      totalHours: 0,
    },
    // Thêm tương tự cho BS215, BS089...
  ];
  const startDate = new Date('2026-03-01');
  const endDate = new Date('2026-03-02');
  return (
    <div className="flex w-full flex-col">
      <div className="h-16 bg-[#E4E4E7] p-4 rounded-t-xl flex justify-between items-center">
        <Tabs
          aria-label="Timekeeping tabs"
          // variant="underlined"
          classNames={{ tab: 'data-[selected=true]:bg-black' }}
          color="primary"
          selectedKey={activeKey}
          onSelectionChange={(key) => setActiveKey(key as TAB_KEYS)}
        >
          {tabs.map((tab) => (
            <Tab key={tab.key} title={tab.label} />
          ))}
        </Tabs>
        <div className='text-[18px] font-semibold'>
          {dayjs(startDate).format('DD/MM/YYYY')} - {dayjs(endDate).format('DD/MM/YYYY')}
        </div>
        <div className='flex gap-2'>
          <Button isIconOnly className='bg-white' radius='full'>
            <IconChevronLeft />
          </Button>
          <Button isIconOnly className='bg-white' radius='full'>
            <IconChevronRight />
          </Button>
        </div>
      </div>
      <AttendanceSummary />
    </div>
  );
};
