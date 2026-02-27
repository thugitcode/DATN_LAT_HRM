import { useState, useEffect, useRef, type FC } from 'react';
import { Card, CardHeader, CardBody, Chip, Divider, Button, Input, Select, SelectItem, Textarea } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import {
    IconPencil,
    IconUser,
    IconPhone,
    IconBriefcase,
    IconSchool,
    IconPlus,
    IconNotes
} from '@tabler/icons-react';
import type { Staff } from '@/types/staff.type';
import { departmentQueryOptions } from '@/services/query-options/department.query';
import { roomQueryOptions } from '@/services/query-options/room.query';

import {
    StaffJobTitleEnum,
    StaffPositionEnum,
    StaffAcademicTitleEnum,
    StaffQualificationEnum
} from '@/types/staff.type';

interface StaffDetailInfoProps {
    staff: Staff;
    isEditingAll?: boolean;
    onUpdate?: (data: Record<string, unknown>) => void;
    isUpdating?: boolean;
}

const formatDateForInput = (dateStr?: string | Date) => {
    if (!dateStr) return '';
    try {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return '';
        return date.toISOString().split('T')[0];
    } catch {
        return '';
    }
};

const translateJobTitle = (title: string) => {
    const titles: Record<string, string> = {
        'DOCTOR': 'Bác sĩ',
        'NURSE': 'Điều dưỡng',
        'TECHNICIAN': 'Kỹ thuật viên',
        'MIDWIFE': 'Hộ sinh',
        'PHYSICIAN_ASSISTANT': 'Y sĩ',
        'OFFICE_STAFF': 'Nhân viên văn phòng',
        'MANAGEMENT': 'Quản lý',
        'LAB_TECHNICIAN': 'Kỹ thuật viên xét nghiệm',
        'IMAGING_TECHNICIAN': 'Kỹ thuật viên chẩn đoán hình ảnh',
        'CASHIER': 'Thu ngân',
        'RECEPTIONIST': 'Lễ tân',
        'WAREHOUSE_KEEPER': 'Thủ kho',
        'PHARMACIST': 'Dược sĩ',
        'SALES': 'Sale',
        'TELESALES': 'Telesale',
        'MARKETING': 'Marketing',
        'CUSTOMER_SUPPORT': 'Chăm sóc khách hàng',
        'MARKETING_LEAD': 'Trưởng nhóm marketing',
        'CUSTOMER_SUPPORT_LEAD': 'Trưởng nhóm CSKH',
    };
    return titles[title] || title || '—';
};

const translatePosition = (position: string) => {
    const positions: Record<string, string> = {
        'STAFF': 'Nhân viên',
        'HEAD_OF_DEPARTMENT': 'Trưởng khoa',
        'DEPUTY_HEAD_OF_DEPARTMENT': 'Phó khoa',
        'CHIEF_NURSE': 'Điều dưỡng trưởng',
        'MANAGER': 'Trưởng phòng',
        'HEAD_OF_UNIT': 'Trưởng bộ phận',
        'DEPUTY_MANAGER': 'Phó phòng',
    };
    return positions[position] || position || '—';
};

const translateContractType = (type: string) => {
    const types: Record<string, string> = {
        'FULL_TIME': 'Nhân viên chính thức',
        'PROBATION': 'Nhân viên thử việc',
        'INTERNSHIP': 'Nhân viên học việc',
        'EXPERT_COOPERATION': 'Chuyên gia hợp tác',
    };
    return types[type] || type || '—';
};

const translateWorkType = (type: string) => {
    const types: Record<string, string> = {
        'FULL_TIME': 'Toàn thời gian',
        'PART_TIME': 'Bán thời gian',
    };
    return types[type] || type || '—';
};

const translateAcademicTitle = (title: string) => {
    const titles: Record<string, string> = {
        'DOCTOR': 'Bác sĩ',
        'MASTER': 'Thạc sĩ',
        'PHD': 'Tiến sĩ',
        'SPECIALIST_I': 'Bác sĩ chuyên khoa I',
        'SPECIALIST_II': 'Bác sĩ chuyên khoa II',
        'RESIDENT_PHYSICIAN': 'Bác sĩ nội trú',
        'PROFESSOR': 'Giáo sư',
        'ASSOCIATE_PROFESSOR': 'Phó giáo sư',
        'PEOPLES_PHYSICIAN': 'TTND',
        'EMINENT_PHYSICIAN': 'TTUT',
        'BACHELOR': 'Cử nhân',
        'ENGINEER': 'Kỹ sư',
    };
    return titles[title] || title || '—';
};

const translateQualification = (q: string) => {
    const qs: Record<string, string> = {
        'INTERMEDIATE': 'Trung cấp',
        'COLLEGE': 'Cao đẳng',
        'BACHELOR': 'Đại học',
        'MASTER': 'Thạc sĩ',
        'DOCTOR': 'Bác sĩ',
        'PHD': 'Tiến sĩ',
        'SPECIALIST_DOCTOR': 'Bác sĩ chuyên khoa',
        'OTHER': 'Khác',
    };
    return qs[q] || q || '—';
};

const InfoRow: FC<{
    label: string;
    value: string | React.ReactNode;
    isEditing?: boolean;
    fieldName?: string;
    type?: string;
    editValue?: string;
}> = ({ label, value, isEditing, fieldName, type = 'text', editValue }) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs text-[#71717A] uppercase font-medium">{label}</span>
        {isEditing ? (
            <Input
                size="sm"
                name={fieldName}
                type={type}
                defaultValue={editValue ?? (typeof value === 'string' ? value : '')}
                classNames={{
                    inputWrapper: "bg-white border border-[#E4E4E7] shadow-sm rounded-lg h-9 min-h-9",
                    input: "text-sm text-[#11181C]"
                }}
            />
        ) : (
            <div className="text-sm text-[#11181C] font-medium min-h-[1.25rem]">
                {value || '—'}
            </div>
        )}
    </div>
);

const InfoCard: FC<{
    title: string;
    icon: React.ReactNode;
    isEditingAll?: boolean;
    onUpdate?: (data: Record<string, unknown>) => void;
    isUpdating?: boolean;
    isUpdating?: boolean;
    children: (isEditing: boolean, startEditing: () => void) => React.ReactNode;
}> = ({ title, icon, isEditingAll = false, onUpdate, isUpdating, children }) => {
    const [isEditingSelf, setIsEditingSelf] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isEditingAll) {
            setIsEditingSelf(true);
        } else {
            setIsEditingSelf(false);
        }
    }, [isEditingAll]);

    const isEditing = isEditingSelf || isEditingAll;

    const collectFormData = (): Record<string, unknown> => {
        const data: Record<string, unknown> = {};
        if (cardRef.current) {
            // Collect standard inputs and textareas
            const inputs = cardRef.current.querySelectorAll('input[name], textarea[name]');
            inputs.forEach((input) => {
                const el = input as HTMLInputElement | HTMLTextAreaElement;
                if (!el.name) return;

                const val = el.value.trim();
                // Send null if cleared, ignore our display placeholder '—'
                if (val === '' || val === '—') {
                    data[el.name] = null;
                } else {
                    data[el.name] = val;
                }
            });

            // Collect selects
            const selects = cardRef.current.querySelectorAll('select[name]');
            selects.forEach((select) => {
                const el = select as HTMLSelectElement;
                if (el.name) {
                    data[el.name] = el.value || null;
                }
            });

            // Special handling for HeroUI Select (hidden inputs)
            const hiddenInputs = cardRef.current.querySelectorAll('input[type="hidden"][name]');
            hiddenInputs.forEach((input) => {
                const el = input as HTMLInputElement;
                if (!el.name) return;

                const isArrayField = ['academicTitles', 'departmentIds', 'roomIds'].includes(el.name);
                if (isArrayField) {
                    data[el.name] = el.value ? el.value.split(',').filter(Boolean) : [];
                } else {
                    data[el.name] = el.value || null;
                }
            });
        }
        return data;
    };

    const handleSave = () => {
        const data = collectFormData();
        onUpdate?.(data);
        setIsEditingSelf(false);
    };

    const handleCancel = () => {
        setIsEditingSelf(false);
    };

    return (
        <Card ref={cardRef} className="shadow-sm border border-[#F4F4F5] rounded-2xl overflow-hidden bg-white">
            <CardHeader className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#F4F4F5]">
                <div className="flex items-center gap-2">
                    <div className="text-[#11181C]">{icon}</div>
                    <h3 className="text-[15px] font-bold text-[#11181C]">{title}</h3>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing && !isEditingAll ? (
                        <>
                            <Button
                                variant="bordered"
                                size="sm"
                                className="bg-white border-[#E4E4E7] text-[#71717A] font-semibold h-8 rounded-lg px-3"
                                onPress={handleCancel}
                                isDisabled={isUpdating}
                            >
                                Hủy
                            </Button>
                            <Button
                                color="primary"
                                size="sm"
                                className="h-8 px-3 font-semibold rounded-lg bg-[#006FEE]"
                                onPress={handleSave}
                                isLoading={isUpdating}
                            >
                                Lưu
                            </Button>
                        </>
                    ) : !isEditingAll ? (
                        <Button
                            isIconOnly
                            variant="flat"
                            size="sm"
                            className="bg-[#F4F4F5] rounded-lg min-w-8 w-8 h-8"
                            onPress={() => setIsEditingSelf(true)}
                        >
                            <IconPencil size={16} className="text-[#11181C]" />
                        </Button>
                    ) : null}
                </div>
            </CardHeader>
            <CardBody className="px-6 py-5 bg-white">
                {children(isEditing, () => setIsEditingSelf(true))}
            </CardBody>
        </Card>
    );
};

/* ====== Employment Info Card with multi-select for Khoa/Phòng ====== */
const EmploymentInfoCard: FC<{
    staff: Staff;
    isEditingAll?: boolean;
    onUpdate?: (data: Record<string, unknown>) => void;
    isUpdating?: boolean;
}> = ({ staff, isEditingAll = false, onUpdate, isUpdating }) => {
    const [isEditingSelf, setIsEditingSelf] = useState(false);
    const { data: deptData } = useQuery(departmentQueryOptions.list({ getAll: true }));
    const { data: roomData } = useQuery(roomQueryOptions.list({ getAll: true }));
    const cardRef = useRef<HTMLDivElement>(null);

    const currentDeptIds = staff.rlsStaffDepartments?.map(rsd => rsd.department.id) || [];
    const currentRoomIds = staff.rlsStaffRooms?.map(rsr => rsr.room.id) || [];

    const [selectedDeptIds, setSelectedDeptIds] = useState<Set<string>>(new Set(currentDeptIds));
    const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set(currentRoomIds));

    const departments = deptData?.data || [];
    const rooms = roomData?.data || [];

    useEffect(() => {
        if (isEditingAll) {
            setIsEditingSelf(true);
        } else {
            setIsEditingSelf(false);
            setSelectedDeptIds(new Set(currentDeptIds));
            setSelectedRoomIds(new Set(currentRoomIds));
        }
    }, [isEditingAll]);

    const isEditing = isEditingSelf || isEditingAll;

    const collectFormData = (): Record<string, unknown> => {
        const data: Record<string, unknown> = {};
        data.departmentIds = Array.from(selectedDeptIds);
        data.roomIds = Array.from(selectedRoomIds);
        if (cardRef.current) {
            const inputs = cardRef.current.querySelectorAll('input[name]');
            inputs.forEach((input) => {
                const el = input as HTMLInputElement;
                if (!el.name) return;

                // Fields handled by state (arrays) or single inputs
                if (el.name === 'departmentIds' || el.name === 'roomIds') return;

                const val = el.value.trim();
                if (val === '' || val === '—') {
                    data[el.name] = null;
                } else {
                    data[el.name] = val;
                }
            });

            const hiddenInputs = cardRef.current.querySelectorAll('input[type="hidden"][name]');
            hiddenInputs.forEach((input) => {
                const el = input as HTMLInputElement;
                if (!el.name) return;

                if (el.name === 'departmentIds' || el.name === 'roomIds') return; // Handled by state
                data[el.name] = el.value || null;
            });
        }
        return data;
    };

    const handleSave = () => {
        const data = collectFormData();
        onUpdate?.(data);
        setIsEditingSelf(false);
    };

    const handleCancel = () => {
        setIsEditingSelf(false);
        setSelectedDeptIds(new Set(currentDeptIds));
        setSelectedRoomIds(new Set(currentRoomIds));
    };

    return (
        <Card ref={cardRef} className="shadow-sm border border-[#F4F4F5] rounded-2xl overflow-hidden bg-white">
            <CardHeader className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#F4F4F5]">
                <div className="flex items-center gap-2">
                    <div className="text-[#11181C]"><IconBriefcase size={20} /></div>
                    <h3 className="text-[15px] font-bold text-[#11181C]">Thông tin công việc</h3>
                </div>
                <div className="flex items-center gap-2">
                    {isEditing && !isEditingAll ? (
                        <>
                            <Button variant="bordered" size="sm" className="bg-white border-[#E4E4E7] text-[#71717A] font-semibold h-8 rounded-lg px-3" onPress={handleCancel} isDisabled={isUpdating}>
                                Hủy
                            </Button>
                            <Button color="primary" size="sm" className="h-8 px-3 font-semibold rounded-lg bg-[#006FEE]" onPress={handleSave} isLoading={isUpdating}>
                                Lưu
                            </Button>
                        </>
                    ) : !isEditingAll ? (
                        <Button isIconOnly variant="flat" size="sm" className="bg-[#F4F4F5] rounded-lg min-w-8 w-8 h-8" onPress={() => setIsEditingSelf(true)}>
                            <IconPencil size={16} className="text-[#11181C]" />
                        </Button>
                    ) : null}
                </div>
            </CardHeader>
            <CardBody className="p-6">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    {/* Khoa quản lý */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#71717A] uppercase font-medium">Khoa quản lý</span>
                        {isEditing ? (
                            <Select
                                name="departmentIds"
                                selectionMode="multiple"
                                selectedKeys={selectedDeptIds}
                                onSelectionChange={(keys) => setSelectedDeptIds(new Set(Array.from(keys).map(String)))}
                                placeholder="Chọn khoa"
                                size="sm"
                                classNames={{
                                    trigger: "bg-white border border-[#E4E4E7] shadow-sm rounded-lg min-h-9",
                                    value: "text-sm text-[#11181C]"
                                }}
                            >
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id as string}>{dept.name}</SelectItem>
                                ))}
                            </Select>
                        ) : (
                            <div className="flex flex-wrap gap-1.5 min-h-[1.25rem]">
                                {staff.rlsStaffDepartments && staff.rlsStaffDepartments.length > 0
                                    ? staff.rlsStaffDepartments.map((rsd) => (
                                        <Chip key={rsd.id as string} size="sm" variant="flat" classNames={{ base: "bg-[#EFF6FF] h-6", content: "text-[#006FEE] font-medium text-xs px-1" }}>
                                            {rsd.department.name}
                                        </Chip>
                                    ))
                                    : <span className="text-sm text-[#11181C] font-medium">—</span>
                                }
                            </div>
                        )}
                    </div>

                    {/* Phòng quản lý */}
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#71717A] uppercase font-medium">Phòng quản lý</span>
                        {isEditing ? (
                            <Select
                                name="roomIds"
                                selectionMode="multiple"
                                selectedKeys={selectedRoomIds}
                                onSelectionChange={(keys) => setSelectedRoomIds(new Set(Array.from(keys).map(String)))}
                                placeholder="Chọn phòng"
                                size="sm"
                                classNames={{
                                    trigger: "bg-white border border-[#E4E4E7] shadow-sm rounded-lg min-h-9",
                                    value: "text-sm text-[#11181C]"
                                }}
                            >
                                {rooms.map((room) => (
                                    <SelectItem key={room.id as string}>{room.name}</SelectItem>
                                ))}
                            </Select>
                        ) : (
                            <div className="flex flex-wrap gap-1.5 min-h-[1.25rem]">
                                {staff.rlsStaffRooms && staff.rlsStaffRooms.length > 0
                                    ? staff.rlsStaffRooms.map((rsr) => (
                                        <Chip key={rsr.id as string} size="sm" variant="flat" classNames={{ base: "bg-[#F0FDF4] h-6", content: "text-[#16A34A] font-medium text-xs px-1" }}>
                                            {rsr.room.name}
                                        </Chip>
                                    ))
                                    : <span className="text-sm text-[#11181C] font-medium">—</span>
                                }
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#71717A] uppercase font-medium">Chức danh</span>
                        {isEditing ? (
                            <Select
                                size="sm"
                                name="jobTitle"
                                defaultSelectedKeys={staff.jobTitle ? [staff.jobTitle] : []}
                                classNames={{
                                    trigger: "bg-white border border-[#E4E4E7] shadow-sm rounded-lg min-h-9",
                                    value: "text-sm text-[#11181C]"
                                }}
                            >
                                {Object.values(StaffJobTitleEnum).map((val) => (
                                    <SelectItem key={val as string}>{translateJobTitle(val as string)}</SelectItem>
                                ))}
                            </Select>
                        ) : (
                            <div className="text-sm text-[#11181C] font-medium min-h-[1.25rem]">
                                {translateJobTitle(staff.jobTitle as string)}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-[#71717A] uppercase font-medium">Cấp bậc</span>
                        {isEditing ? (
                            <Select
                                size="sm"
                                name="position"
                                defaultSelectedKeys={staff.position ? [staff.position] : []}
                                classNames={{
                                    trigger: "bg-white border border-[#E4E4E7] shadow-sm rounded-lg min-h-9",
                                    value: "text-sm text-[#11181C]"
                                }}
                            >
                                {Object.values(StaffPositionEnum).map((val) => (
                                    <SelectItem key={val as string}>{translatePosition(val as string)}</SelectItem>
                                ))}
                            </Select>
                        ) : (
                            <div className="text-sm text-[#11181C] font-medium min-h-[1.25rem]">
                                {translatePosition(staff.position as string)}
                            </div>
                        )}
                    </div>

                    <InfoRow label="Loại hình hợp đồng" value={translateContractType(staff.currentContractType as string)} isEditing={false} />
                    <InfoRow label="Loại hình" value={translateWorkType(staff.currentWorkType as string)} isEditing={false} />
                    <InfoRow label="Thời hạn làm việc" value="5 năm 2 tháng" isEditing={false} />
                </div>
            </CardBody>
        </Card>
    );
};

export const StaffDetailInfo: FC<StaffDetailInfoProps> = ({ staff, isEditingAll = false, onUpdate, isUpdating }) => {
    return (
        <div id="staff-detail-form" className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
            <div className="space-y-6">
                {/* Personnel Information */}
                <InfoCard title="Thông tin nhân sự" icon={<IconUser size={20} />} isEditingAll={isEditingAll} onUpdate={onUpdate} isUpdating={isUpdating}>
                    {(isEditing) => (
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <InfoRow label="Mã nhân viên" value={staff.code} isEditing={false} />
                            <InfoRow label="Tên nhân viên" value={staff.name} isEditing={isEditing} fieldName="name" />
                            <InfoRow label="Ngày sinh" value={staff.birthday ? new Date(staff.birthday).toLocaleDateString('vi-VN') : '—'} isEditing={isEditing} fieldName="birthday" type="date" editValue={formatDateForInput(staff.birthday)} />
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-[#71717A] uppercase font-medium">Giới tính</span>
                                {isEditing ? (
                                    <Select
                                        size="sm"
                                        name="gender"
                                        defaultSelectedKeys={staff.gender ? [staff.gender] : []}
                                        classNames={{
                                            trigger: "bg-white border border-[#E4E4E7] shadow-sm rounded-lg min-h-9",
                                            value: "text-sm text-[#11181C]"
                                        }}
                                    >
                                        <SelectItem key="MALE">Nam</SelectItem>
                                        <SelectItem key="FEMALE">Nữ</SelectItem>
                                        <SelectItem key="OTHER">Khác</SelectItem>
                                    </Select>
                                ) : (
                                    <div className="text-sm text-[#11181C] font-medium min-h-[1.25rem]">
                                        {staff.gender === 'MALE' ? 'Nam' : staff.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                                    </div>
                                )}
                            </div>
                            <InfoRow label="Số CCCD/Passport" value={staff.identity} isEditing={isEditing} fieldName="identity" />
                            <InfoRow label="Ngày cấp" value={staff.identityIssueDate ? new Date(staff.identityIssueDate).toLocaleDateString('vi-VN') : '—'} isEditing={isEditing} fieldName="identityIssueDate" type="date" editValue={formatDateForInput(staff.identityIssueDate)} />
                            <InfoRow label="Nơi cấp" value={staff.identityIssuePlace} isEditing={isEditing} fieldName="identityIssuePlace" />
                            <InfoRow label="Quốc tịch" value={staff.nationality} isEditing={isEditing} fieldName="nationality" />
                            <div className="col-span-2">
                                <InfoRow label="Địa chỉ" value={staff.address} isEditing={isEditing} fieldName="address" />
                            </div>
                        </div>
                    )}
                </InfoCard>

                {/* Employment Information */}
                <EmploymentInfoCard
                    staff={staff}
                    isEditingAll={isEditingAll}
                    onUpdate={onUpdate}
                    isUpdating={isUpdating}
                />

                {/* Additional Information */}
                <InfoCard title="Thông tin bổ sung" icon={<IconPlus size={20} />} isEditingAll={isEditingAll} onUpdate={onUpdate} isUpdating={isUpdating}>
                    {(isEditing) => (
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <InfoRow label="Mã số thuế" value={staff.taxCode} isEditing={isEditing} fieldName="taxCode" />
                            <InfoRow label="Số BHYT" value={staff.insuranceNumber} isEditing={isEditing} fieldName="insuranceNumber" />
                            <InfoRow label="Số tài khoản" value={staff.accountNumber} isEditing={isEditing} fieldName="accountNumber" />
                            <InfoRow label="Tên người thụ hưởng" value={staff.beneficiaryName} isEditing={isEditing} fieldName="beneficiaryName" />
                            <InfoRow label="Tên ngân hàng" value={staff.bankName} isEditing={isEditing} fieldName="bankName" />
                        </div>
                    )}
                </InfoCard>
            </div>

            <div className="space-y-6">
                {/* Contact Information */}
                <InfoCard title="Thông tin liên hệ" icon={<IconPhone size={20} />} isEditingAll={isEditingAll} onUpdate={onUpdate} isUpdating={isUpdating}>
                    {(isEditing, startEditing) => (
                        <div className="space-y-6">
                            <div>
                                <span className="text-[13px] font-semibold text-[#11181C]">Thông tin chính</span>
                                <div className="grid grid-cols-2 gap-4 mt-3">
                                    <InfoRow label="Số điện thoại" value={<span className="text-[#006FEE]">{staff.phone}</span>} isEditing={isEditing} fieldName="phone" />
                                    <InfoRow label="Email" value={<span className="text-[#006FEE]">{staff.email}</span>} isEditing={isEditing} fieldName="email" />
                                </div>
                            </div>
                            <Divider className="bg-[#F4F4F5]" />
                            <div>
                                <span className="text-[13px] font-semibold text-[#11181C]">Thông tin liên hệ khẩn cấp</span>
                                {isEditing ? (
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <InfoRow label="Người liên hệ" value={staff.emergencyContact} isEditing={isEditing} fieldName="emergencyContact" />
                                        <InfoRow label="Số điện thoại" value={staff.emergencyContactPhone} isEditing={isEditing} fieldName="emergencyContactPhone" />
                                        <div className="col-span-2">
                                            <InfoRow label="Địa chỉ" value={staff.emergencyContactAddress} isEditing={isEditing} fieldName="emergencyContactAddress" />
                                        </div>
                                        <InfoRow label="Mối quan hệ" value={staff.emergencyContactRelationship} isEditing={isEditing} fieldName="emergencyContactRelationship" />
                                    </div>
                                ) : staff.emergencyContact ? (
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <InfoRow label="Người liên hệ" value={staff.emergencyContact} />
                                        <InfoRow label="Số điện thoại" value={staff.emergencyContactPhone} />
                                        <div className="col-span-2">
                                            <InfoRow label="Địa chỉ" value={staff.emergencyContactAddress} />
                                        </div>
                                        <InfoRow label="Mối quan hệ" value={staff.emergencyContactRelationship} />
                                    </div>
                                ) : (
                                    <div
                                        className="flex flex-col items-center justify-center p-6 bg-[#FAFAFA] rounded-xl border border-dashed border-[#E4E4E7] mt-3 cursor-pointer hover:bg-[#F4F4F5] transition-colors"
                                        onClick={startEditing}
                                    >
                                        <div className="w-10 h-10 bg-white shadow-sm border border-[#E4E4E7] rounded-lg flex items-center justify-center mb-2">
                                            <IconPlus size={20} className="text-[#71717A]" />
                                        </div>
                                        <span className="text-xs text-[#71717A]">Chưa cung cấp</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </InfoCard>

                {/* Professional Qualifications */}
                <InfoCard title="Bằng cấp chuyên môn" icon={<IconSchool size={20} />} isEditingAll={isEditingAll} onUpdate={onUpdate} isUpdating={isUpdating}>
                    {(isEditing) => (
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-[#71717A] uppercase font-medium">Trình độ chuyên môn</span>
                                {isEditing ? (
                                    <Select
                                        size="sm"
                                        name="qualification"
                                        defaultSelectedKeys={staff.qualification ? [staff.qualification] : []}
                                        classNames={{
                                            trigger: "bg-white border border-[#E4E4E7] shadow-sm rounded-lg min-h-9",
                                            value: "text-sm text-[#11181C]"
                                        }}
                                    >
                                        {Object.values(StaffQualificationEnum).map((val) => (
                                            <SelectItem key={val as string}>{translateQualification(val as string)}</SelectItem>
                                        ))}
                                    </Select>
                                ) : (
                                    <div className="text-sm text-[#11181C] font-medium min-h-[1.25rem]">
                                        {translateQualification(staff.qualification as string)}
                                    </div>
                                )}
                            </div>
                            <InfoRow label="Chuyên ngành" value={staff.major} isEditing={isEditing} fieldName="major" />
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-[#71717A] uppercase font-medium">Học hàm, học vị</span>
                                {isEditing ? (
                                    <Select
                                        size="sm"
                                        name="academicTitles"
                                        selectionMode="multiple"
                                        defaultSelectedKeys={staff.academicTitles ? new Set(staff.academicTitles) : new Set()}
                                        classNames={{
                                            trigger: "bg-white border border-[#E4E4E7] shadow-sm rounded-lg min-h-9",
                                            value: "text-sm text-[#11181C]"
                                        }}
                                    >
                                        {Object.values(StaffAcademicTitleEnum).map((val) => (
                                            <SelectItem key={val as string}>{translateAcademicTitle(val as string)}</SelectItem>
                                        ))}
                                    </Select>
                                ) : (
                                    <div className="text-sm text-[#11181C] font-medium min-h-[1.25rem]">
                                        {staff.academicTitles?.map(t => translateAcademicTitle(t)).join(', ') || '—'}
                                    </div>
                                )}
                            </div>
                            <InfoRow label="Số CCHN" value={staff.certificateNumber} isEditing={isEditing} fieldName="certificateNumber" />
                            <InfoRow label="Nơi cấp" value={staff.certificateIssuePlace} isEditing={isEditing} fieldName="certificateIssuePlace" />
                            <InfoRow label="Ngày hết hạn" value={staff.certificateExpiryDate ? new Date(staff.certificateExpiryDate).toLocaleDateString('vi-VN') : '—'} isEditing={isEditing} fieldName="certificateExpiryDate" type="date" editValue={formatDateForInput(staff.certificateExpiryDate)} />
                        </div>
                    )}
                </InfoCard>

                {/* Notes */}
                <InfoCard title="Ghi chú" icon={<IconNotes size={20} />} isEditingAll={isEditingAll} onUpdate={onUpdate} isUpdating={isUpdating}>
                    {(isEditing) => (
                        <Textarea
                            placeholder="Nhập ghi chú"
                            name="note"
                            defaultValue={staff.note || ''}
                            isReadOnly={!isEditing}
                            classNames={{
                                inputWrapper: "bg-white border border-[#E4E4E7] shadow-sm rounded-xl p-4 min-h-[140px]",
                                input: "text-sm text-[#11181C]"
                            }}
                        />
                    )}
                </InfoCard>
            </div>
        </div>
    );
};
