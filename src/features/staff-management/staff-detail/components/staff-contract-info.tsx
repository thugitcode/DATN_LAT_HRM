import { type FC, useState, useMemo, useCallback, Fragment } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    useDisclosure,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    addToast,
    Input,
    Select,
    SelectItem,
    Checkbox,
    Autocomplete,
    AutocompleteItem,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from '@heroui/react';
import {
    IconFileDescription,
    IconHistory,
    IconPencil,
    IconPlus,
    IconTrash,
    IconX,
    IconAlertCircle,
    IconChevronDown,
} from '@tabler/icons-react';
import {
    useStaffContracts,
    useApproveContract,
    useSignContract,
    useDeleteContract,
    useUpdateContract,
} from '@/query-options/staff-contract';
import { useStaffList } from '@/query-options/staff';
import { ContractStatusEnum, StaffPositionEnum } from '@/types/staff.type';
import type { StaffContract } from '@/types/staff.type';
import dayjs from 'dayjs';
import { StaffContractFormDrawer } from './staff-contract-form-drawer';
import { useQuery } from '@tanstack/react-query';
import { departmentQueryOptions } from '@/services/query-options/department.query';
import { roomQueryOptions } from '@/services/query-options/room.query';
import { shiftTemplateQueryOptions } from '@/services/query-options/shift-template.query';
import { normalizeAxiosError } from '@/lib/axios';

interface StaffContractInfoProps {
    staffId: string;
}

const JOB_TITLE_OPTIONS = [
    { key: 'DOCTOR', label: 'Bác sĩ' },
    { key: 'NURSE', label: 'Điều dưỡng' },
    { key: 'TECHNICIAN', label: 'Kỹ thuật viên' },
    { key: 'MIDWIFE', label: 'Hộ sinh' },
    { key: 'PHYSICIAN_ASSISTANT', label: 'Y sĩ' },
    { key: 'OFFICE_STAFF', label: 'Nhân viên văn phòng' },
];

const POSITION_OPTIONS = [
    { key: 'STAFF', label: 'Nhân viên' },
    { key: 'HEAD_OF_DEPARTMENT', label: 'Trưởng khoa' },
    { key: 'DEPUTY_HEAD_OF_DEPARTMENT', label: 'Phó khoa' },
    { key: 'CHIEF_NURSE', label: 'Điều dưỡng trưởng' },
    { key: 'MANAGER', label: 'Trưởng phòng' },
    { key: 'HEAD_OF_UNIT', label: 'Trưởng bộ phận' },
    { key: 'DEPUTY_MANAGER', label: 'Phó phòng' },
];

const SHIFT_TYPE_OPTIONS = [
    { key: 'FIXED', label: 'Ca cố định' },
    { key: 'FLEXIBLE', label: 'Ca linh hoạt' },
    { key: 'SPLIT', label: 'Ca gãy' },
];

const WORKING_DAYS = [
    { key: 1, label: 'Thứ 2' },
    { key: 2, label: 'Thứ 3' },
    { key: 3, label: 'Thứ 4' },
    { key: 4, label: 'Thứ 5' },
    { key: 5, label: 'Thứ 6' },
    { key: 6, label: 'Thứ 7' },
    { key: 0, label: 'Chủ nhật' },
];

const translateContractType = (type: string) => {
    const types: Record<string, string> = {
        FULL_TIME: 'Hợp đồng nhân viên chính thức',
        PROBATION: 'Hợp đồng thử việc',
        INTERNSHIP: 'Hợp đồng học việc',
        EXPERT_COOPERATION: 'Chuyên gia hợp tác',
    };
    return types[type] || type || '—';
};

const translateWorkType = (type: string) => {
    const types: Record<string, string> = {
        FULL_TIME: 'Fulltime',
        PART_TIME: 'Part-time',
    };
    return types[type] || type || '—';
};

const translateJobTitle = (title: string) => {
    return JOB_TITLE_OPTIONS.find((o) => o.key === title)?.label || title || '—';
};

const translatePosition = (position: string) => {
    return POSITION_OPTIONS.find((o) => o.key === position)?.label || position || '—';
};

const translateShiftType = (type: string) => {
    return SHIFT_TYPE_OPTIONS.find((o) => o.key === type)?.label || type || '—';
};

const getStatusChip = (status: ContractStatusEnum) => {
    switch (status) {
        case ContractStatusEnum.PENDING_APPROVAL:
            return <Chip size="sm" variant="flat" className="bg-[#FFF7ED] text-[#EA580C] border-none font-medium text-xs px-2">Chờ duyệt</Chip>;
        case ContractStatusEnum.PENDING_SIGNATURE:
            return <Chip size="sm" variant="flat" className="bg-[#EFF6FF] text-[#006FEE] border-none font-medium text-xs px-2">Chờ ký</Chip>;
        case ContractStatusEnum.SIGNED:
            return <Chip size="sm" variant="flat" className="bg-[#F0FDF4] text-[#16A34A] border-none font-medium text-xs px-2">Đã ký</Chip>;
        case ContractStatusEnum.EXPIRED:
            return <Chip size="sm" variant="flat" className="bg-[#FEF2F2] text-[#DC2626] border-none font-medium text-xs px-2">Hết hạn</Chip>;
        default:
            return null;
    }
};

const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex flex-col gap-1.5">
        <span className="text-[12px] text-[#71717A] uppercase font-semibold">{label}</span>
        <span className="text-[14px] text-[#11181C] font-semibold">{value || '—'}</span>
    </div>
);

const formatWorkingDays = (days?: number[]) => {
    if (!days || days.length === 0) return '—';
    return days.map((d) => WORKING_DAYS.find((wd) => wd.key === d)?.label || `Thứ ${d}`).join(', ');
};

interface WorkingArea {
    departmentId: string;
    roomIds: string[];
}

interface EditFormData {
    jobTitle: string;
    position: string;
    duration: number;
    durationUnit: string;
    departmentId: string;
    roomId: string;
    workingAreas: WorkingArea[];
    directManagerIds: string[];
    shiftType: string;
    fixedShiftId: string;
    workingDays: number[];
}

const initFormFromContract = (contract: StaffContract | undefined): EditFormData => {
    const staff = contract?.staff;
    const rlsDepts = staff?.rlsStaffDepartments || [];
    const rlsRooms = staff?.rlsStaffRooms || [];

    const workingAreas: WorkingArea[] = rlsDepts.map((rd: any) => {
        const deptId = rd.department?.id || '';
        const roomIds = rlsRooms.filter((rr: any) => rr.room?.department?.id === deptId).map((rr: any) => rr.room?.id as string);
        return { departmentId: deptId, roomIds };
    });

    return {
        jobTitle: contract?.jobTitle || '',
        position: contract?.position || '',
        duration: contract?.duration || 1,
        durationUnit: contract?.durationUnit || 'YEAR',
        departmentId: contract?.department?.id || '',
        roomId: '',
        workingAreas: workingAreas.length > 0 ? workingAreas : [{ departmentId: contract?.department?.id || '', roomIds: [] }],
        directManagerIds: contract?.directManagerIds || [],
        shiftType: contract?.shiftType || '',
        fixedShiftId: contract?.fixedShiftId || '',
        workingDays: contract?.workingDays || [1, 2, 3, 4, 5],
    };
};

export const StaffContractInfo: FC<StaffContractInfoProps> = ({ staffId }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { data: response, isLoading } = useStaffContracts(staffId);
    const contracts = response?.data || [];
    const currentContract = contracts.find((c) => c.status === ContractStatusEnum.SIGNED) || contracts[0];

    const approveMutation = useApproveContract(staffId);
    const signMutation = useSignContract(staffId);
    const deleteMutation = useDeleteContract(staffId);
    const updateMutation = useUpdateContract(staffId);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<EditFormData>(() => initFormFromContract(currentContract));
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();

    // Data queries for dropdowns
    const { data: departmentsRes } = useQuery({ ...departmentQueryOptions.list({ getAll: true } as any) });
    const { data: roomsRes } = useQuery({ ...roomQueryOptions.list({ getAll: true } as any) });
    const { data: shiftsRes } = useQuery({
        ...shiftTemplateQueryOptions.list({ getAll: true, type: 'FIXED', status: 'ACTIVE' }),
        enabled: formData.shiftType === 'FIXED',
    });

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

    const departments = departmentsRes?.data || [];
    const rooms = roomsRes?.data || [];
    const shifts = (shiftsRes?.data || []) as any[];
    const managers = managersRes?.data || [];

    const workHistories = useMemo(() => {
        return contracts
            .flatMap((c) =>
                (c.staffWorkHistory || []).map((wh) => ({
                    ...wh,
                    _contractId: c.id,
                    _staffCode: c.staff?.code,
                    _staffName: c.staff?.name,
                    _departmentName: c.department?.name,
                })),
            )
            .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf());
    }, [contracts]);

    const handleStartEdit = useCallback(() => {
        setFormData(initFormFromContract(currentContract));
        setErrors({});
        setIsEditing(true);
    }, [currentContract]);

    const handleCancelEdit = useCallback(() => {
        setIsEditing(false);
        setErrors({});
    }, []);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};
        if (!formData.jobTitle) newErrors.jobTitle = 'Chức danh không được để trống.';
        if (!formData.position) newErrors.position = 'Cấp bậc không được để trống.';
        if (!formData.duration || formData.duration <= 0) newErrors.duration = 'Thời gian hợp đồng không được để trống.';
        if (!formData.departmentId) newErrors.departmentId = 'Khoa quản lý không được để trống.';
        const firstArea = formData.workingAreas[0];
        if (formData.workingAreas.length > 0 && firstArea && !firstArea.departmentId) {
            newErrors.workingAreaDept0 = 'Khoa làm việc không được để trống.';
        }
        if (!formData.shiftType) newErrors.shiftType = 'Loại hình làm việc theo ca không được để trống.';
        if (!formData.directManagerIds || formData.directManagerIds.length === 0) {
            newErrors.directManagerIds = 'Quản lý trực tiếp không được để trống.';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSave = useCallback(async () => {
        if (!validateForm() || !currentContract) return;
        setIsSaving(true);
        try {
            await updateMutation.mutateAsync({
                id: currentContract.id,
                data: {
                    jobTitle: formData.jobTitle,
                    position: formData.position,
                    duration: formData.duration,
                    durationUnit: formData.durationUnit,
                    departmentId: formData.departmentId,
                    workingAreas: formData.workingAreas,
                    directManagerIds: formData.directManagerIds,
                    shiftType: formData.shiftType || undefined,
                    fixedShiftId: formData.fixedShiftId || undefined,
                    workingDays: formData.workingDays,
                },
            });
            addToast({ title: 'Cập nhật thông tin nhân viên thành công.', color: 'success' });
            setIsEditing(false);
        } catch (err) {
            addToast({ title: normalizeAxiosError(err).message, color: 'danger' });
        } finally {
            setIsSaving(false);
        }
    }, [validateForm, currentContract, formData, updateMutation]);

    const handleApprove = useCallback((contractId: string) => {
        approveMutation.mutate(contractId, {
            onSuccess: () => addToast({ title: 'Duyệt hợp đồng thành công', color: 'success' }),
            onError: (error) => addToast({ title: 'Duyệt hợp đồng thất bại', description: error.message, color: 'danger' }),
        });
    }, [approveMutation]);

    const handleSign = useCallback((contractId: string) => {
        signMutation.mutate(contractId, {
            onSuccess: () => addToast({ title: 'Ký hợp đồng thành công', color: 'success' }),
            onError: (error) => addToast({ title: 'Ký hợp đồng thất bại', description: error.message, color: 'danger' }),
        });
    }, [signMutation]);

    const handleDeleteConfirm = useCallback(() => {
        if (!deleteTargetId) return;
        deleteMutation.mutate(deleteTargetId, {
            onSuccess: () => {
                addToast({ title: 'Xóa hợp đồng thành công', color: 'success' });
                onDeleteClose();
                setDeleteTargetId(null);
            },
            onError: (error) => addToast({ title: 'Xóa hợp đồng thất bại', description: error.message, color: 'danger' }),
        });
    }, [deleteTargetId, deleteMutation, onDeleteClose]);

    const openDeleteModal = useCallback((contractId: string) => {
        setDeleteTargetId(contractId);
        onDeleteOpen();
    }, [onDeleteOpen]);

    const addWorkingArea = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            workingAreas: [...prev.workingAreas, { departmentId: '', roomIds: [] }],
        }));
    }, []);

    const removeWorkingArea = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            workingAreas: prev.workingAreas.filter((_, i) => i !== index),
        }));
    }, []);

    const updateWorkingArea = useCallback((index: number, field: 'departmentId' | 'roomIds', value: string | string[]) => {
        setFormData((prev) => {
            const updated: WorkingArea[] = [...prev.workingAreas];
            const current = updated[index];
            if (current) {
                if (field === 'departmentId') {
                    updated[index] = { ...current, departmentId: value as string };
                } else {
                    updated[index] = { ...current, roomIds: value as string[] };
                }
            }
            return { ...prev, workingAreas: updated };
        });
    }, []);

    const toggleWorkingDay = useCallback((day: number) => {
        setFormData((prev) => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter((d) => d !== day)
                : [...prev.workingDays, day],
        }));
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#006FEE] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (contracts.length === 0) {
        return (
            <div className="space-y-6 mt-4">
                <Card className="shadow-none border border-[#F4F4F5] rounded-2xl overflow-hidden bg-white">
                    <CardBody className="flex flex-col items-center justify-center py-16 gap-4">
                        <IconAlertCircle size={48} className="text-[#A1A1AA]" />
                        <p className="text-[15px] text-[#71717A] text-center">
                            Nhân viên chưa có dữ liệu hợp đồng, vui lòng thêm mới hợp đồng.
                        </p>
                        <Button color="primary" size="sm" startContent={<IconPlus size={18} />} className="bg-[#006FEE] text-white font-semibold h-9 rounded-xl px-4" onPress={onOpen}>
                            Thêm mới hợp đồng
                        </Button>
                    </CardBody>
                </Card>
                <StaffContractFormDrawer isOpen={isOpen} onClose={onClose} staffId={staffId} />
            </div>
        );
    }

    const inputClassNames = { inputWrapper: 'bg-[#F4F4F5] rounded-xl shadow-none' };
    const selectClassNames = { trigger: 'bg-[#F4F4F5] rounded-xl shadow-none' };

    return (
        <div className="space-y-6 mt-4">
            {/* Contract Details */}
            <Card className="shadow-none border border-[#F4F4F5] rounded-2xl overflow-hidden bg-white">
                <CardHeader className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#F4F4F5]">
                    <div className="flex items-center gap-2">
                        <IconFileDescription size={20} className="text-[#11181C]" />
                        <h3 className="text-[16px] font-bold text-[#11181C]">Thông tin hợp đồng</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <Button variant="bordered" size="sm" className="border-[#E4E4E7] text-[#11181C] font-semibold h-9 rounded-xl px-4" onPress={handleCancelEdit}>
                                    Hủy
                                </Button>
                                <Button color="primary" size="sm" className="bg-[#006FEE] text-white font-semibold h-9 rounded-xl px-4" isLoading={isSaving} onPress={handleSave}>
                                    Lưu
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button variant="flat" size="sm" startContent={<IconPencil size={18} />} className="bg-[#F4F4F5] text-[#11181C] font-semibold h-9 rounded-xl px-4" onPress={handleStartEdit}>
                                    Chỉnh sửa
                                </Button>
                                <Button color="primary" size="sm" startContent={<IconPlus size={18} />} className="bg-[#006FEE] text-white font-semibold h-9 rounded-xl px-4" onPress={onOpen}>
                                    Thêm mới hợp đồng
                                </Button>
                            </>
                        )}
                    </div>
                </CardHeader>
                <CardBody className="p-6">
                    {isEditing ? (
                        <div className="pr-12 flex flex-col gap-6">
                            {/* Row 1: Loại hợp đồng + Loại hình (readonly) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Loại hợp đồng" labelPlacement="outside" value={translateContractType(currentContract?.contractType as string)} isReadOnly isRequired classNames={inputClassNames} />
                                <Input label="Loại hình" labelPlacement="outside" value={translateWorkType(currentContract?.workType as string)} isReadOnly isRequired classNames={inputClassNames} />
                            </div>

                            {/* Row 2: Chức danh + Cấp bậc */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Chức danh"
                                    isRequired
                                    labelPlacement="outside"
                                    placeholder="Chọn chức danh"
                                    selectedKeys={formData.jobTitle ? [formData.jobTitle] : []}
                                    onSelectionChange={(keys) => {
                                        const val = Array.from(keys)[0] as string;
                                        setFormData((p) => ({ ...p, jobTitle: val }));
                                    }}
                                    classNames={selectClassNames}
                                    isInvalid={!!errors.jobTitle}
                                    errorMessage={errors.jobTitle}
                                >
                                    {JOB_TITLE_OPTIONS.map((o) => <SelectItem key={o.key}>{o.label}</SelectItem>)}
                                </Select>
                                <Select
                                    label="Cấp bậc"
                                    isRequired
                                    labelPlacement="outside"
                                    placeholder="Chọn cấp bậc"
                                    selectedKeys={formData.position ? [formData.position] : []}
                                    onSelectionChange={(keys) => {
                                        const val = Array.from(keys)[0] as string;
                                        setFormData((p) => ({ ...p, position: val }));
                                    }}
                                    classNames={selectClassNames}
                                    isInvalid={!!errors.position}
                                    errorMessage={errors.position}
                                >
                                    {POSITION_OPTIONS.map((o) => <SelectItem key={o.key}>{o.label}</SelectItem>)}
                                </Select>
                            </div>

                            {/* Row 3: Thời hạn + Số hợp đồng */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Thời hạn hợp đồng"
                                    isRequired
                                    labelPlacement="outside"
                                    placeholder="Nhập"
                                    type="number"
                                    value={String(formData.duration)}
                                    onValueChange={(v) => setFormData((p) => ({ ...p, duration: Number(v) || 0 }))}
                                    classNames={inputClassNames}
                                    isInvalid={!!errors.duration}
                                    errorMessage={errors.duration}
                                    endContent={
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <Button
                                                    variant="bordered"
                                                    className="h-8 min-w-[85px] border-[#E4E4E7] text-sm text-[#71717A] font-medium px-3 flex justify-between items-center rounded-lg bg-white"
                                                    endContent={<IconChevronDown size={14} />}
                                                >
                                                    {formData.durationUnit === 'YEAR' ? 'Năm' : 'Tháng'}
                                                </Button>
                                            </DropdownTrigger>
                                            <DropdownMenu
                                                aria-label="Chọn đơn vị"
                                                disallowEmptySelection
                                                selectionMode="single"
                                                selectedKeys={new Set([formData.durationUnit])}
                                                onSelectionChange={(keys) => {
                                                    const val = Array.from(keys)[0] as string;
                                                    setFormData((p) => ({ ...p, durationUnit: val }));
                                                }}
                                            >
                                                <DropdownItem key="YEAR">Năm</DropdownItem>
                                                <DropdownItem key="MONTH">Tháng</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    }
                                />
                                <Input label="Số hợp đồng" labelPlacement="outside" value={currentContract?.contractNumber || ''} isReadOnly classNames={inputClassNames} />
                            </div>

                            {/* Row 4: Ngày bắt đầu + Ngày kết thúc */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Ngày bắt đầu" labelPlacement="outside" value={currentContract?.startDate ? dayjs(currentContract.startDate).format('D/M/YYYY') : ''} isReadOnly isRequired classNames={inputClassNames} />
                                <Input label="Ngày kết thúc" labelPlacement="outside" value={currentContract?.endDate ? dayjs(currentContract.endDate).format('D/M/YYYY') : ''} isReadOnly isRequired classNames={inputClassNames} />
                            </div>

                            {/* Row 5: Khoa quản lý + Phòng quản lý */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Khoa quản lý"
                                    isRequired
                                    labelPlacement="outside"
                                    placeholder="Chọn khoa"
                                    selectedKeys={formData.departmentId ? [formData.departmentId] : []}
                                    onSelectionChange={(keys) => {
                                        const val = Array.from(keys)[0] as string;
                                        setFormData((p) => ({ ...p, departmentId: val }));
                                    }}
                                    classNames={selectClassNames}
                                    isInvalid={!!errors.departmentId}
                                    errorMessage={errors.departmentId}
                                >
                                    {departments.map((d) => <SelectItem key={d.id}>{d.name}</SelectItem>)}
                                </Select>
                                <Select
                                    label="Phòng quản lý"
                                    labelPlacement="outside"
                                    placeholder="Chọn phòng"
                                    selectedKeys={formData.roomId ? [formData.roomId] : []}
                                    onSelectionChange={(keys) => {
                                        const val = Array.from(keys)[0] as string;
                                        setFormData((p) => ({ ...p, roomId: val }));
                                    }}
                                    classNames={selectClassNames}
                                >
                                    {rooms.map((r) => <SelectItem key={r.id}>{r.name}</SelectItem>)}
                                </Select>
                            </div>

                            {/* Khoa/phòng làm việc (dynamic rows) */}
                            {formData.workingAreas.map((area, idx) => (
                                <div key={idx} className="relative">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select
                                            label="Khoa làm việc"
                                            isRequired
                                            labelPlacement="outside"
                                            placeholder="Chọn khoa"
                                            selectedKeys={area.departmentId ? [area.departmentId] : []}
                                            onSelectionChange={(keys) => {
                                                const val = Array.from(keys)[0] as string;
                                                updateWorkingArea(idx, 'departmentId', val);
                                            }}
                                            classNames={selectClassNames}
                                            isInvalid={!!errors[`workingAreaDept${idx}`]}
                                            errorMessage={errors[`workingAreaDept${idx}`]}
                                        >
                                            {departments.map((d) => <SelectItem key={d.id}>{d.name}</SelectItem>)}
                                        </Select>
                                        <Select
                                            label="Phòng làm việc"
                                            labelPlacement="outside"
                                            placeholder="Chọn phòng"
                                            selectionMode="multiple"
                                            selectedKeys={new Set(area.roomIds)}
                                            onSelectionChange={(keys) => {
                                                updateWorkingArea(idx, 'roomIds', Array.from(keys).map(String));
                                            }}
                                            classNames={selectClassNames}
                                        >
                                            {rooms.filter(r => !area.departmentId || r.department?.id === area.departmentId).map((r) => <SelectItem key={r.id}>{r.name}</SelectItem>)}
                                        </Select>
                                    </div>
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        className={`absolute -right-12 bottom-0 h-10 text-[#71717A] min-w-10 ${formData.workingAreas.length <= 1 || idx === 0 ? 'invisible' : ''}`}
                                        onPress={() => removeWorkingArea(idx)}
                                    >
                                        <IconTrash size={18} />
                                    </Button>
                                </div>
                            ))}

                            <div className="-mt-2">
                                <Button variant="light" color="primary" className="justify-start px-0 font-medium text-[14px] w-fit" startContent={<IconPlus size={16} />} onPress={addWorkingArea}>
                                    Thêm mới
                                </Button>
                            </div>

                            {/* Quản lý trực tiếp + Loại hình ca */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Select
                                    label="Quản lý trực tiếp"
                                    labelPlacement="outside"
                                    placeholder="Chọn"
                                    isRequired
                                    selectedKeys={new Set(formData.directManagerIds)}
                                    onSelectionChange={(keys) => {
                                        setFormData((p) => ({ ...p, directManagerIds: Array.from(keys).map(String) }));
                                    }}
                                    selectionMode="multiple"
                                    classNames={selectClassNames}
                                    isInvalid={!!errors.directManagerIds}
                                    errorMessage={errors.directManagerIds}
                                >
                                    {managers.map((m) => (
                                        <SelectItem key={m.id} textValue={`${m.code} - ${m.name}`}>
                                            {m.code} - {m.name}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Loại hình làm việc theo ca"
                                    isRequired
                                    labelPlacement="outside"
                                    placeholder="Chọn"
                                    selectedKeys={formData.shiftType ? [formData.shiftType] : []}
                                    onSelectionChange={(keys) => {
                                        const val = Array.from(keys)[0] as string;
                                        setFormData((p) => ({ ...p, shiftType: val }));
                                    }}
                                    classNames={selectClassNames}
                                    isInvalid={!!errors.shiftType}
                                    errorMessage={errors.shiftType}
                                >
                                    {SHIFT_TYPE_OPTIONS.map((o) => <SelectItem key={o.key}>{o.label}</SelectItem>)}
                                </Select>
                            </div>

                            {/* Ca làm việc - chỉ hiển thị khi Ca cố định */}
                            {formData.shiftType === 'FIXED' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Autocomplete
                                        label="Ca làm việc"
                                        isRequired
                                        labelPlacement="outside"
                                        placeholder="Tìm theo mã ca hoặc tên ca"
                                        selectedKey={formData.fixedShiftId || null}
                                        onSelectionChange={(key) => {
                                            setFormData((p) => ({ ...p, fixedShiftId: key ? String(key) : '' }));
                                        }}
                                        classNames={{ base: 'w-full' }}
                                        inputProps={{ classNames: { inputWrapper: 'bg-[#F4F4F5] rounded-xl shadow-none' } }}
                                    >
                                        {shifts.map((s) => (
                                            <AutocompleteItem key={s.id} textValue={`${s.code} - ${s.name}`}>
                                                {s.code} - {s.name}
                                            </AutocompleteItem>
                                        ))}
                                    </Autocomplete>
                                </div>
                            )}

                            {/* Ngày làm việc - chỉ hiển thị khi Ca cố định */}
                            {formData.shiftType === 'FIXED' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-[#11181C] flex gap-1">Ngày làm việc <span className="text-danger">*</span></label>
                                    <div className="flex flex-wrap gap-4">
                                        {WORKING_DAYS.map((day) => (
                                            <Checkbox key={day.key} isSelected={formData.workingDays.includes(day.key)} onValueChange={() => toggleWorkingDay(day.key)} size="sm" classNames={{ label: 'text-sm text-[#3F3F46]' }}>
                                                {day.label}
                                            </Checkbox>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                            <InfoRow label="Loại hợp đồng" value={translateContractType(currentContract?.contractType as string)} />
                            <InfoRow label="Loại hình" value={translateWorkType(currentContract?.workType as string)} />
                            <InfoRow label="Chức danh" value={translateJobTitle(currentContract?.jobTitle as string)} />
                            <InfoRow label="Cấp bậc" value={translatePosition(currentContract?.position as string)} />
                            <InfoRow label="Thời hạn hợp đồng" value={currentContract ? `${currentContract.duration} ${currentContract.durationUnit === 'YEAR' ? 'năm' : 'tháng'}` : ''} />
                            <InfoRow label="Ngày bắt đầu" value={currentContract?.startDate ? dayjs(currentContract.startDate).format('DD/MM/YYYY') : ''} />
                            <InfoRow label="Ngày kết thúc" value={currentContract?.endDate ? dayjs(currentContract.endDate).format('DD/MM/YYYY') : ''} />
                            <InfoRow label="Số hợp đồng" value={currentContract?.contractNumber} />
                            <InfoRow label="Khoa quản lý" value={currentContract?.department?.name} />
                            <InfoRow label="Phòng quản lý" value="—" />
                            <InfoRow label="Khoa làm việc" value={currentContract?.department?.name} />
                            <InfoRow label="Phòng làm việc" value="—" />
                            <InfoRow
                                label="Quản lý trực tiếp"
                                value={
                                    currentContract?.directManagerIds?.length
                                        ? managers
                                            .filter((m) => currentContract.directManagerIds!.includes(m.id))
                                            .map((m) => m.name)
                                            .join(', ')
                                        : '—'
                                }
                            />
                            <InfoRow label="Loại hình làm việc theo ca" value={currentContract?.shiftType ? translateShiftType(currentContract.shiftType) : '—'} />
                            <InfoRow label="Ca làm việc" value={currentContract?.fixedShiftId ? (() => { const found = shifts.find((s) => s.id === currentContract.fixedShiftId); return found ? `${found.code} - ${found.name}` : '—'; })() : '—'} />
                            <div className="col-span-1 md:col-span-2">
                                <InfoRow label="Ngày làm việc" value={formatWorkingDays(currentContract?.workingDays)} />
                            </div>
                        </div>
                    )}
                </CardBody>
            </Card>

            {/* Work History */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                    <IconHistory size={20} className="text-[#11181C]" />
                    <h3 className="text-[16px] font-bold text-[#11181C]">Lịch sử làm việc</h3>
                </div>
                <Table
                    aria-label="Work history table"
                    classNames={{
                        base: 'shadow-none border border-[#F4F4F5] rounded-2xl overflow-hidden bg-white',
                        thead: 'bg-[#F8FAFC]',
                        th: 'bg-[#F8FAFC] text-[#71717A] font-bold text-[13px] border-b border-[#F4F4F5] h-12 uppercase',
                        td: 'py-4 text-[14px] text-[#11181C] border-b border-[#F4F4F5]',
                    }}
                    shadow="none"
                >
                    <TableHeader>
                        <TableColumn>MÃ NHÂN VIÊN</TableColumn>
                        <TableColumn>TÊN NHÂN VIÊN</TableColumn>
                        <TableColumn>CHỨC DANH</TableColumn>
                        <TableColumn>CẤP BẬC</TableColumn>
                        <TableColumn>KHOA/PHÒNG</TableColumn>
                        <TableColumn>LOẠI HỢP ĐỒNG</TableColumn>
                        <TableColumn>LOẠI HÌNH</TableColumn>
                        <TableColumn>THỜI GIAN</TableColumn>
                        <TableColumn>NGÀY BẤT ĐẦU</TableColumn>
                        <TableColumn>NGÀY KẾT THÚC</TableColumn>
                        <TableColumn>TRẠNG THÁI</TableColumn>
                        <TableColumn align="center">{''}</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="Chưa có dữ liệu lịch sử làm việc">
                        {workHistories.map((history) => {
                            const contractStatus = history.contractStatus as unknown as string;
                            const canEdit = contractStatus === 'PENDING_APPROVAL' || contractStatus === 'PENDING_SIGNATURE';
                            const canDelete = canEdit;
                            return (
                                <TableRow key={history.id}>
                                    <TableCell>#{history._staffCode || '—'}</TableCell>
                                    <TableCell>{history._staffName || '—'}</TableCell>
                                    <TableCell>{translateJobTitle(history.jobTitle)}</TableCell>
                                    <TableCell>{translatePosition(history.position)}</TableCell>
                                    <TableCell>{history._departmentName || '—'}</TableCell>
                                    <TableCell>{translateContractType(history.contractType)}</TableCell>
                                    <TableCell>{translateWorkType(history.workType)}</TableCell>
                                    <TableCell>{history.duration} {history.durationUnit === 'YEAR' ? 'năm' : 'tháng'}</TableCell>
                                    <TableCell>{dayjs(history.startDate).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell>{dayjs(history.endDate).format('DD/MM/YYYY')}</TableCell>
                                    <TableCell>{getStatusChip(history.contractStatus as unknown as ContractStatusEnum)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-2">
                                            {contractStatus === 'PENDING_APPROVAL' && (
                                                <>
                                                    <Button isIconOnly size="sm" variant="flat" className="bg-[#FEE2E2] text-[#EF4444] min-w-8 w-8 h-8 rounded-lg" onPress={() => openDeleteModal(history._contractId)}>
                                                        <IconX size={16} />
                                                    </Button>
                                                    <Button size="sm" color="primary" className="bg-[#006FEE] text-white font-semibold h-8 rounded-lg px-4" isLoading={approveMutation.isPending} onPress={() => handleApprove(history._contractId)}>
                                                        Duyệt
                                                    </Button>
                                                </>
                                            )}
                                            {contractStatus === 'PENDING_SIGNATURE' && (
                                                <>
                                                    <Button isIconOnly size="sm" variant="flat" className="bg-[#FEE2E2] text-[#EF4444] min-w-8 w-8 h-8 rounded-lg" onPress={() => openDeleteModal(history._contractId)}>
                                                        <IconX size={16} />
                                                    </Button>
                                                    <Button size="sm" className="bg-[#020617] text-white font-semibold h-8 rounded-lg px-4" isLoading={signMutation.isPending} onPress={() => handleSign(history._contractId)}>
                                                        Ký hợp đồng
                                                    </Button>
                                                </>
                                            )}
                                            {canEdit && (
                                                <Button isIconOnly size="sm" variant="light" className="min-w-8 w-8 h-8 text-[#71717A]" onPress={onOpen}>
                                                    <IconPencil size={18} />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button isIconOnly size="sm" variant="light" className="min-w-8 w-8 h-8 text-[#71717A]" onPress={() => openDeleteModal(history._contractId)}>
                                                    <IconTrash size={18} />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} size="md">
                <ModalContent>
                    <ModalHeader className="flex items-center gap-2">
                        <IconAlertCircle size={20} className="text-[#EF4444]" />
                        <span>Xác nhận xóa hợp đồng</span>
                    </ModalHeader>
                    <ModalBody>
                        <p className="text-[14px] text-[#3F3F46]">
                            Thông tin hợp đồng sau khi xóa không thể hoàn tác, bạn có chắc chắn muốn xóa hợp đồng?
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="bordered" className="border-[#E4E4E7] text-[#11181C] font-semibold h-10 px-6 rounded-xl" onPress={onDeleteClose}>
                            Hủy
                        </Button>
                        <Button color="danger" className="font-semibold h-10 px-6 rounded-xl" isLoading={deleteMutation.isPending} onPress={handleDeleteConfirm}>
                            Xóa
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            <StaffContractFormDrawer isOpen={isOpen} onClose={onClose} staffId={staffId} />
        </div>
    );
};

