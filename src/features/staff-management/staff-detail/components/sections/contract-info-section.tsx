// sections/ContractInfoSection.tsx
import { FC } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { IconChevronDown, IconFileDescription } from '@tabler/icons-react';

import { useQuery } from '@tanstack/react-query';
import { departmentQueryOptions } from '@/services/query-options/department.query';
import { roomQueryOptions } from '@/services/query-options/room.query';
import { useStaffList } from '@/query-options/staff';
import { StaffPositionEnum } from '@/types/staff.type';

// Các custom component bạn đã có
import { Button, Checkbox, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@heroui/react';
import { FormSelect } from '@/components/form-fields/form-select';
import { FormInput } from '@/components/form-fields/form-input';
import { FormDatePicker } from '@/components/form-fields/form-date-picker';
import { FormNumberInput } from '@/components/form-fields/form-number-input';
import { cn } from '@/lib/utils';
import { FormLabel } from '@/components/form-fields/form-label';
import { WorkingAreaSection } from './working-area-section';

// Nếu bạn có FormMultiSelect hoặc FormCheckboxGroup thì càng tốt
// tạm thời giả sử bạn chưa có → mình sẽ xử lý ngày làm việc bằng cách thủ công hoặc sau

export const ContractInfoSection: FC = () => {
  const { control, watch, setValue, formState: { isSubmitting, errors } } = useFormContext();

  // Master data
  const { data: departmentsRes } = useQuery(departmentQueryOptions.list({ getAll: true }));
  const departments = departmentsRes?.data || [];

  const { data: roomsRes } = useQuery(roomQueryOptions.list({ getAll: true }));
  const rooms = roomsRes?.data || [];
  console.log(errors, 7777, errors.duration);

  const { data: managersRes } = useStaffList({
    getAll: true,
    positions: [
      StaffPositionEnum.HEAD_OF_DEPARTMENT,
      StaffPositionEnum.DEPUTY_HEAD_OF_DEPARTMENT,
      StaffPositionEnum.CHIEF_NURSE,
      StaffPositionEnum.MANAGER,
      StaffPositionEnum.HEAD_OF_UNIT,
      StaffPositionEnum.DEPUTY_MANAGER,
    ],
  });
  const managers = managersRes?.data || [];

  // Watch
  const shiftType = watch('shiftType');
  const departmentId = watch('departmentId');

  // Chuẩn bị options cho các Select
  const contractTypeOptions = [
    { key: 'FULL_TIME', label: 'Nhân viên chính thức' },
    { key: 'PROBATION', label: 'Thử việc' },
    { key: 'INTERNSHIP', label: 'Học việc' },
    { key: 'EXPERT_COOPERATION', label: 'Chuyên gia hợp tác' },
  ];

  const workTypeOptions = [
    { key: 'FULL_TIME', label: 'Fulltime' },
    { key: 'PART_TIME', label: 'Parttime' },
  ];

  const jobTitleOptions = [
    { key: 'DOCTOR', label: 'Bác sĩ' },
    { key: 'NURSE', label: 'Điều dưỡng' },
    { key: 'TECHNICIAN', label: 'Kỹ thuật viên' },
    { key: 'OFFICE_STAFF', label: 'Nhân viên văn phòng' },
    { key: 'PHARMACIST', label: 'Dược sĩ' },
  ];

  const positionOptions = [
    { key: 'STAFF', label: 'Nhân viên' },
    { key: 'HEAD_OF_DEPARTMENT', label: 'Trưởng khoa' },
    { key: 'DEPUTY_HEAD_OF_DEPARTMENT', label: 'Phó khoa' },
    { key: 'MANAGER', label: 'Trưởng phòng' },
    { key: 'DEPUTY_MANAGER', label: 'Phó phòng' },
  ];

  const durationUnitOptions = [
    { key: 'YEAR', label: 'Năm' },
    { key: 'MONTH', label: 'Tháng' },
  ];

  const shiftTypeOptions = [
    { key: 'FIXED', label: 'Ca cố định' },
    { key: 'FLEXIBLE', label: 'Ca linh hoạt' },
    { key: 'SPLIT', label: 'Ca gãy' },
  ];

  const departmentOptions = departments.map(d => ({
    key: d.id,
    label: d.name,
  }));

  const roomOptions = rooms
    .filter(r => !departmentId || r.department?.id === departmentId)
    .map(r => ({
      key: r.id,
      label: r.name,
    }));

  const managerOptions = managers.map(m => ({
    key: m.id,
    label: `${m.code} - ${m.name}`,
  }));

  // Ca làm việc (ví dụ tĩnh - thay bằng API thật khi có)
  const shiftOptions = [
    { key: 'C1', label: 'Ca 1 (06:00 - 14:00)' },
    { key: 'C2', label: 'Ca 2 (14:00 - 22:00)' },
    { key: 'C3', label: 'Ca 3 (22:00 - 06:00)' },
  ];

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-2">
        <IconFileDescription size={20} className="text-[#11181C]" />
        <h3 className="text-[15px] font-bold text-[#11181C]">Thông tin hợp đồng</h3>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <FormSelect
            control={control}
            name="contractType"
            label="Loại hợp đồng"
            isRequired
            options={contractTypeOptions}
            disabled={isSubmitting}
          />

          <FormSelect
            control={control}
            name="workType"
            label="Loại hình"
            isRequired
            options={workTypeOptions}
            disabled={isSubmitting}
          />

          <FormSelect
            control={control}
            name="jobTitle"
            label="Chức danh"
            isRequired
            options={jobTitleOptions}
            disabled={isSubmitting}
          />

          <FormSelect
            control={control}
            name="position"
            label="Cấp bậc"
            isRequired
            options={positionOptions}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Thời hạn hợp đồng - kết hợp Input + Select unit */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-1.5">
              <FormLabel label={"Thời hạn hợp đồng"} isRequired={true} isError={errors.hasOwnProperty('duration')} />

              <FormNumberInput
                control={control}
                name="duration"
                placeholder="Nhập"
                isRequired
                disabled={isSubmitting}
                classNames={{
                  // inputWrapper: "pr-28", // hoặc pr-[7rem] nếu cần rộng hơn
                }}
                endContent={
                  <div className="flex items-center gap-2">
                    <Dropdown>
                      <DropdownTrigger>
                        <Button
                          variant="bordered"
                          className="h-8 min-h-8 min-w-[85px] border-[#E4E4E7] text-sm text-[#71717A] font-medium px-3 flex justify-between items-center rounded-lg bg-white transition-all hover:bg-gray-50"
                          endContent={<IconChevronDown size={14} />}
                          isDisabled={isSubmitting}
                        >
                          {watch('durationUnit') === 'YEAR' ? 'Năm' : 'Tháng'}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Chọn đơn vị"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={new Set([watch('durationUnit') || 'YEAR'])}
                        onSelectionChange={(keys) => {
                          const unit = Array.from(keys)[0] as string;
                          setValue('durationUnit', unit, { shouldValidate: true });
                        }}
                      >
                        <DropdownItem key="YEAR">Năm</DropdownItem>
                        <DropdownItem key="MONTH">Tháng</DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                }
              />
            </div>
          </div>

          <FormInput
            control={control}
            name="contractNumber"
            label="Số hợp đồng"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormDatePicker
            control={control}
            name="startDate"
            label="Ngày bắt đầu"
            isRequired
            disabled={isSubmitting}
          />

          <FormDatePicker
            control={control}
            name="endDate"
            label="Ngày kết thúc"
            isRequired
            disabled={isSubmitting}
          />
        </div>

        {/* <div className="grid grid-cols-2 gap-4">
          <FormSelect
            control={control}
            name="departmentId"
            label="Khoa quản lý"
            isRequired
            options={departmentOptions}
            disabled={isSubmitting}
          // Nếu muốn reset room khi đổi khoa, bạn có thể thêm onChange custom
          // hoặc xử lý trong useEffect + watch
          />

          <FormSelect
            control={control}
            name="roomId"
            label="Phòng quản lý"
            options={roomOptions}
            disabled={isSubmitting || !departmentId}
          />
        </div> */}
        <WorkingAreaSection />

        <FormSelect
          control={control}
          name="directManagerIds"
          label="Quản lý trực tiếp"
          isRequired
          options={managerOptions}
          disabled={isSubmitting}
          selectionMode='multiple'
        />

        <div className={cn(shiftType === 'FIXED' ? "grid-cols-2" : "grid-cols-1", "grid gap-4 items-end")}>
          <FormSelect
            control={control}
            name="shiftType"
            label="Loại hình làm việc theo ca"
            isRequired
            options={shiftTypeOptions}
            disabled={isSubmitting}
          />

          {shiftType === 'FIXED' && (
            <FormSelect
              control={control}
              name="fixedShiftId"
              label="Ca làm việc"
              isRequired
              options={shiftOptions}
              disabled={isSubmitting}
            />
          )}
        </div>

        {shiftType === 'FIXED' && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#11181C]">
              Ngày làm việc <span className="text-danger">*</span>
            </label>
            <div className="flex flex-wrap gap-4">
              {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, idx) => {
                const dayValue = idx === 6 ? 0 : idx + 1;
                return (
                  // Nếu chưa có FormCheckboxGroup, tạm dùng Checkbox gốc
                  // hoặc bạn tạo thêm component FormCheckbox sau
                  <Checkbox
                    key={day}
                    isSelected={watch('workingDays')?.includes(dayValue) ?? false}
                    onValueChange={checked => {
                      const current = watch('workingDays') || [];
                      if (checked) {
                        setValue('workingDays', [...current, dayValue], { shouldValidate: true });
                      } else {
                        setValue('workingDays', current.filter(d => d !== dayValue), { shouldValidate: true });
                      }
                    }}
                    size="sm"
                  >
                    {day}
                  </Checkbox>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};