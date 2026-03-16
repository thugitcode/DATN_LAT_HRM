// sections/WorkingAreaSection.tsx
import { useFormContext, useFieldArray } from 'react-hook-form';
import {
    Button,
} from '@heroui/react'; // hoặc từ thư viện bạn dùng
import { IconCirclePlus, IconCirclePlusFilled, IconPlus, IconTrash as TrashIcon } from '@tabler/icons-react';


import { useQuery } from '@tanstack/react-query';
import { departmentQueryOptions } from '@/services/query-options/department.query';
import { roomQueryOptions } from '@/services/query-options/room.query';
import type { FC } from 'react';
import { FormSelect } from '@/components/form-fields/form-select';

export const WorkingAreaSection: FC = () => {
    const { control, watch, formState: { isSubmitting } } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'workingAreas',
    });

    // Master data
    const { data: departmentsRes } = useQuery(departmentQueryOptions.list({ getAll: true }));
    const departments = departmentsRes?.data || [];

    const { data: roomsRes } = useQuery(roomQueryOptions.list({ getAll: true }));
    const rooms = roomsRes?.data || [];

    // Chuẩn bị options
    const departmentOptions = departments.map((d) => ({
        key: d.id,
        label: d.name,
    }));

    // Lấy departmentId của từng field để filter phòng
    const workingAreas = watch('workingAreas') || [];

    return (
        <div>
            <div className="flex flex-col gap-5">
                {fields.map((field, index) => {
                    const currentDeptId = watch(`workingAreas.${index}.departmentId`);

                    // Filter phòng theo khoa đã chọn
                    const filteredRoomOptions = rooms
                        .filter((r) => !currentDeptId || r.department?.id === currentDeptId)
                        .map((r) => ({
                            key: r.id,
                            label: r.name,
                        }));

                    return (
                        <div key={field.id} className="relative flex gap-4">
                            <div className='w-1/2'>
                                <FormSelect
                                    control={control}
                                    name={`workingAreas.${index}.departmentId`}
                                    label="Khoa làm việc"
                                    isRequired
                                    options={departmentOptions}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className='flex-1'>
                                <FormSelect
                                    control={control}
                                    name={`workingAreas.${index}.roomId`}
                                    label="Phòng làm việc"
                                    options={filteredRoomOptions}
                                    disabled={isSubmitting || !currentDeptId}
                                // optional → không bắt buộc
                                />
                            </div>

                            {/* Nút xóa - ẩn nếu chỉ còn 1 dòng và là dòng đầu tiên (tùy logic) */}
                            {fields.length !==1 && <Button
                                isIconOnly
                                variant="light"
                                // color="danger"
                                size="sm"
                                className="top-6"
                                onPress={() => remove(index)}
                                isDisabled={isSubmitting || (fields.length === 1 && index === 0)}
                            >
                                <TrashIcon size={18} />
                            </Button>}
                        </div>
                    );
                })}

                {fields.length === 0 && (
                    <p className="text-sm text-danger text-center py-4">
                        Vui lòng thêm ít nhất một khu vực làm việc
                    </p>
                )}
            </div>
            <div className="flex items-center justify-between mt-4">
                <Button
                    variant="light"
                    color="primary"
                    size="sm"
                    startContent={<IconCirclePlusFilled size={16} />}
                    onPress={() => append({ departmentId: '', roomId: '' })}
                    isDisabled={isSubmitting}
                >
                    Thêm mới
                </Button>
            </div>
        </div >
    );
};