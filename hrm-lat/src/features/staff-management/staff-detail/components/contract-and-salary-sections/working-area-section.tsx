// sections/WorkingAreaSection.tsx
import {
    Button,
} from '@heroui/react'; // hoặc từ thư viện bạn dùng
import { IconCirclePlusFilled, IconTrash as TrashIcon } from '@tabler/icons-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';


import { FormSelect } from '@/components/form-fields/form-select';
import { departmentQueryOptions } from '@/services/query-options/department.query';
import { roomQueryOptions } from '@/services/query-options/room.query';
import { useQuery } from '@tanstack/react-query';
import type { FC } from 'react';
import { cn } from '@/lib/utils';
import { NAMESPACES } from '@/i18n/constants';

export const WorkingAreaSection: FC<{ isView?: boolean; variant?: "flat" | "bordered" | "faded" | "underlined" }> = ({ isView = false, variant = "flat" }) => {
    const { t } = useTranslation([NAMESPACES.STAFF_MANAGEMENT, NAMESPACES.COMMON]);
    const { control, watch, formState: { isSubmitting }, resetField } = useFormContext();

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

    const workingAreas = watch('workingAreas') || [];
    const selectedDeptIds = workingAreas.map((wa: any) => wa.departmentId).filter(Boolean);

    // Lấy departmentId của từng field để filter phòng
    // const workingAreas = watch('workingAreas') || [];

    return (
        <div>
            <div className="flex flex-col gap-5">
                {fields.map((field, index) => {
                    const currentDeptId = watch(`workingAreas.${index}.departmentId`);

                    // Filter khoa: không hiển thị khoa đã được chọn ở các dòng khác
                    const filteredDeptOptions = departmentOptions.filter(
                        (opt) => !selectedDeptIds.includes(opt.key) || opt.key === currentDeptId
                    );

                    // Filter phòng theo khoa đã chọn
                    const filteredRoomOptions = rooms
                        .filter((r) => !currentDeptId || r.department?.id === currentDeptId)
                        .map((r) => ({
                            key: r.id,
                            label: r.name,
                        }));

                    return (
                        <div key={field.id} className="relative flex gap-4">
                            <div className='w-[49%] min-w-[49%]'>
                                <FormSelect
                                    control={control}
                                    name={`workingAreas.${index}.departmentId`}
                                    label={t('working_area.department')}
                                    isRequired
                                    options={filteredDeptOptions}
                                    readOnly={isSubmitting || isView}
                                    variant={variant}
                                    onSelect={() => {
                                        resetField(`workingAreas.${index}.roomId`)
                                    }}
                                />
                            </div>

                            <div className={cn('flex-1', fields.length !== 1 ? 'max-w-[45%]' : 'max-w-[49.5%]')}>
                                <FormSelect
                                    selectionMode='multiple'
                                    control={control}
                                    name={`workingAreas.${index}.roomId`}
                                    label={t('working_area.room')}
                                    options={filteredRoomOptions}
                                    readOnly={isSubmitting || !currentDeptId || isView}
                                    variant={variant}
                                />
                            </div>

                            {/* Nút xóa - ẩn nếu chỉ còn 1 dòng và là dòng đầu tiên */}
                            {fields.length !== 1 && <Button
                                isIconOnly
                                variant="light"
                                // color="danger"
                                size="sm"
                                className="top-6 w-fit"
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
                        {t('working_area.min_required')}
                    </p>
                )}
            </div>
            {!isView && <div className="flex items-center justify-between mt-4">
                <Button
                    variant="light"
                    color="primary"
                    size="sm"
                    startContent={<IconCirclePlusFilled size={16} />}
                    onPress={() => append({ departmentId: '', roomId: [] })}
                    isDisabled={isSubmitting}
                >
                    {t('button.addNew', { ns: 'common' })}
                </Button>
            </div>}
        </div >
    );
};