import { type FC, useState, useCallback, useEffect } from 'react';
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerBody,
    DrawerFooter,
    Button,
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
    IconCurrencyDollar,
    IconHeartbeat,
    IconBeach,
    IconReceiptTax,
    IconShieldCheck,
    IconPlus,
    IconTrash,
    IconChevronDown
} from '@tabler/icons-react';
import { useStaffList } from '@/query-options/staff';
import { useContractDetail, useCreateContract, useUpdateContract } from '@/query-options/staff-contract';
import { StaffPositionEnum } from '@/types/staff.type';
import { useQuery } from '@tanstack/react-query';
import { departmentQueryOptions } from '@/services/query-options/department.query';
import { roomQueryOptions } from '@/services/query-options/room.query';

interface WorkingAreaRow {
    id: number;
    departmentId: string;
    roomId: string;
}

interface StaffContractFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    staffId: string;
    contractId?: string; // Nếu có = edit mode
}

export const StaffContractFormDrawer: FC<StaffContractFormDrawerProps> = ({
    isOpen,
    onClose,
    staffId,
    contractId,
}) => {
    const isEditMode = !!contractId;
    const { data: contractRes, isLoading: isDetailLoading } = useContractDetail(contractId || '');
    const contract = contractRes?.data;
    const salary = contract?.salary;

    const createMutation = useCreateContract(staffId);
    const updateMutation = useUpdateContract(staffId);

    // Form state
    const [contractType, setContractType] = useState('');
    const [workType, setWorkType] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [position, setPosition] = useState('');
    const [duration, setDuration] = useState('');
    const [durationUnit, setDurationUnit] = useState('YEAR');
    const [contractNumber, setContractNumber] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [roomId, setRoomId] = useState('');
    const [directManagerIds, setDirectManagerIds] = useState<string[]>([]);
    const [shiftType, setShiftType] = useState('');
    const [fixedShiftId, setFixedShiftId] = useState('');
    const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5]);

    // Salary state
    const [basicSalary, setBasicSalary] = useState('');
    const [insuranceSalary, setInsuranceSalary] = useState('');
    const [responsibilityAllowance, setResponsibilityAllowance] = useState('');
    const [positionAllowance, setPositionAllowance] = useState('');
    const [hazardAllowance, setHazardAllowance] = useState('');
    const [mealAllowance, setMealAllowance] = useState('');
    const [mealAllowanceUnit, setMealAllowanceUnit] = useState('DAY');
    const [fuelAllowance, setFuelAllowance] = useState('');
    const [phoneAllowance, setPhoneAllowance] = useState('');
    const [businessTripAllowance, setBusinessTripAllowance] = useState('');
    const [otherAllowance, setOtherAllowance] = useState('');

    // Insurance state
    const [hasHealthInsurance, setHasHealthInsurance] = useState(false);
    const [healthInsuranceRate, setHealthInsuranceRate] = useState('');
    const [hasSocialInsurance, setHasSocialInsurance] = useState(false);
    const [socialInsuranceRate, setSocialInsuranceRate] = useState('');
    const [hasUnemploymentInsurance, setHasUnemploymentInsurance] = useState(false);
    const [unemploymentInsuranceRate, setUnemploymentInsuranceRate] = useState('');
    const [hasUnionFee, setHasUnionFee] = useState(false);
    const [unionFee, setUnionFee] = useState('');

    // Healthcare insurance
    const [hasHealthCareInsurance, setHasHealthCareInsurance] = useState(false);
    const [healthCareInsuranceCompany, setHealthCareInsuranceCompany] = useState('');
    const [healthCareInsuranceBenefit, setHealthCareInsuranceBenefit] = useState('');
    const [healthCareInsuranceRate, setHealthCareInsuranceRate] = useState('');

    // Leave & benefits
    const [leaveQuotaIds, setLeaveQuotaIds] = useState<string[]>([]);

    // Tax
    const [hasFamilyDeduction, setHasFamilyDeduction] = useState(false);
    const [dependentsCount, setDependentsCount] = useState('');
    const [hasPersonalIncomeTax, setHasPersonalIncomeTax] = useState(true);
    const [personalIncomeTaxRate, setPersonalIncomeTaxRate] = useState('');

    // Salary info
    const [salaryType, setSalaryType] = useState('NET');
    const [netSalary, setNetSalary] = useState('');
    const [grossSalary, setGrossSalary] = useState('');

    const formatNumber = (val: string | number | undefined) => {
        if (val === undefined || val === null || val === '') return '';
        const num = typeof val === 'number' ? val : parseInt(val.toString().replace(/\D/g, ''), 10);
        if (isNaN(num)) return '';
        return num.toLocaleString('vi-VN');
    };

    const parseNumber = (val: string) => {
        return val.replace(/\D/g, '');
    };

    const [workingAreas, setWorkingAreas] = useState<WorkingAreaRow[]>([]);

    // Fetch master data
    const { data: departmentsRes } = useQuery({ ...departmentQueryOptions.list({ getAll: true } as any) });
    const { data: roomsRes } = useQuery({ ...roomQueryOptions.list({ getAll: true } as any) });
    const departments = departmentsRes?.data || [];
    const rooms = roomsRes?.data || [];

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

    // Reset form for create mode
    useEffect(() => {
        if (!isOpen) return;
        if (!isEditMode) {
            setContractType('');
            setWorkType('');
            setJobTitle('');
            setPosition('');
            setDuration('');
            setDurationUnit('YEAR');
            setContractNumber('');
            setStartDate('');
            setEndDate('');
            setDepartmentId('');
            setRoomId('');
            setDirectManagerIds([]);
            setShiftType('');
            setFixedShiftId('');
            setWorkingDays([1, 2, 3, 4, 5]);
            setBasicSalary('');
            setInsuranceSalary('');
            setResponsibilityAllowance('');
            setPositionAllowance('');
            setHazardAllowance('');
            setMealAllowance('');
            setMealAllowanceUnit('DAY');
            setFuelAllowance('');
            setPhoneAllowance('');
            setBusinessTripAllowance('');
            setOtherAllowance('');
            setHasHealthInsurance(false);
            setHealthInsuranceRate('');
            setHasSocialInsurance(false);
            setSocialInsuranceRate('');
            setHasUnemploymentInsurance(false);
            setUnemploymentInsuranceRate('');
            setHasUnionFee(false);
            setUnionFee('');
            setHasHealthCareInsurance(false);
            setHealthCareInsuranceCompany('');
            setHealthCareInsuranceBenefit('');
            setHealthCareInsuranceRate('');
            setLeaveQuotaIds([]);
            setHasFamilyDeduction(false);
            setDependentsCount('');
            setHasPersonalIncomeTax(true);
            setPersonalIncomeTaxRate('');
            setSalaryType('NET');
            setNetSalary('');
            setGrossSalary('');
            setWorkingAreas([{ id: Date.now(), departmentId: '', roomId: '' }]);
        }
    }, [isOpen, isEditMode]);

    // Fill data when editing
    useEffect(() => {
        if (!contract) return;

        setContractType(contract.contractType || '');
        setWorkType(contract.workType || '');
        setJobTitle(contract.jobTitle || '');
        setPosition(contract.position || '');
        setDuration(contract.duration?.toString() || '');
        setDurationUnit(contract.durationUnit || 'YEAR');
        setContractNumber(contract.contractNumber || '');
        setStartDate(contract.startDate || '');
        setEndDate(contract.endDate || '');
        setDepartmentId(contract.department?.id || '');
        setRoomId(contract.room?.id || '');
        setDirectManagerIds(contract.directManagerIds || []);
        setShiftType(contract.shiftType || '');
        setFixedShiftId(contract.fixedShiftId || '');
        setWorkingDays(contract.workingDays || [1, 2, 3, 4, 5]);

        // Fill salary
        if (salary) {
            setBasicSalary(salary.basicSalary?.toString() || '');
            setInsuranceSalary(salary.insuranceSalary?.toString() || '');
            setResponsibilityAllowance(salary.responsibilityAllowance?.toString() || '');
            setPositionAllowance(salary.positionAllowance?.toString() || '');
            setHazardAllowance(salary.hazardAllowance?.toString() || '');
            setMealAllowance(salary.mealAllowance?.toString() || '');
            setMealAllowanceUnit(salary.mealAllowanceUnit || 'DAY');
            setFuelAllowance(salary.fuelAllowance?.toString() || '');
            setPhoneAllowance(salary.phoneAllowance?.toString() || '');
            setBusinessTripAllowance(salary.businessTripAllowance?.toString() || '');
            setOtherAllowance(salary.otherAllowance?.toString() || '');

            setHasHealthInsurance(salary.hasHealthInsurance || false);
            setHealthInsuranceRate(salary.healthInsuranceRate?.toString() || '');
            setHasSocialInsurance(salary.hasSocialInsurance || false);
            setSocialInsuranceRate(salary.socialInsuranceRate?.toString() || '');
            setHasUnemploymentInsurance(salary.hasUnemploymentInsurance || false);
            setUnemploymentInsuranceRate(salary.unemploymentInsuranceRate?.toString() || '');
            setHasUnionFee(salary.hasUnionFee || false);
            setUnionFee(salary.unionFee?.toString() || '');

            setHasHealthCareInsurance(salary.hasHealthCareInsurance || false);
            setHealthCareInsuranceCompany(salary.healthCareInsuranceCompany || '');
            setHealthCareInsuranceBenefit(salary.healthCareInsuranceBenefit?.toString() || '');
            setHealthCareInsuranceRate(salary.healthCareInsuranceRate?.toString() || '');

            setLeaveQuotaIds(salary.leaveQuotaIds || []);

            setHasFamilyDeduction(salary.hasFamilyDeduction || false);
            setDependentsCount(salary.dependentsCount?.toString() || '');
            setHasPersonalIncomeTax(salary.hasPersonalIncomeTax ?? true);
            setPersonalIncomeTaxRate(salary.personalIncomeTaxRate?.toString() || '');

            setSalaryType(salary.salaryType || 'NET');
            setNetSalary(formatNumber(salary.netSalary));
            setGrossSalary(formatNumber(salary.grossSalary));
        }

        // Fill working areas from staff relations (if any)
        if (contract.staff?.rlsStaffDepartments && contract.staff.rlsStaffDepartments.length > 0) {
            const areas = contract.staff.rlsStaffDepartments.map((rsd: any, idx: number) => {
                const deptId = rsd.department?.id || '';
                // Try to find matching room for this department
                const matchingRooms = contract.staff?.rlsStaffRooms?.filter((rsr: any) => rsr.room?.department?.id === deptId) || [];
                return {
                    id: Date.now() + idx,
                    departmentId: deptId,
                    roomId: matchingRooms[0]?.room?.id || '',
                };
            });
            setWorkingAreas(areas);
        } else {
            setWorkingAreas([{ id: Date.now(), departmentId: '', roomId: '' }]);
        }
    }, [contract, salary]);

    const addWorkingArea = useCallback(() => {
        setWorkingAreas((prev) => [...prev, { id: Date.now(), departmentId: '', roomId: '' }]);
    }, []);

    const removeWorkingArea = useCallback((id: number) => {
        setWorkingAreas((prev) => prev.filter((a) => a.id !== id));
    }, []);

    const updateWorkingArea = useCallback((id: number, field: 'departmentId' | 'roomId', value: string) => {
        setWorkingAreas((prev) => prev.map((a) => a.id === id ? { ...a, [field]: value, ...(field === 'departmentId' ? { roomId: '' } : {}) } : a));
    }, []);

    const handleSave = useCallback(async () => {
        const payload = {
            staffId,
            contractType,
            workType,
            jobTitle,
            position,
            duration: Number(duration),
            durationUnit,
            contractNumber,
            startDate,
            endDate,
            departmentId,
            roomId,
            directManagerIds,
            shiftType,
            fixedShiftId: fixedShiftId || undefined,
            workingDays,
            workingAreas: workingAreas.map(a => ({ departmentId: a.departmentId, roomId: a.roomId || undefined })),
            salary: {
                basicSalary: Number(parseNumber(basicSalary)),
                insuranceSalary: insuranceSalary ? Number(parseNumber(insuranceSalary)) : undefined,
                responsibilityAllowance: responsibilityAllowance ? Number(parseNumber(responsibilityAllowance)) : undefined,
                positionAllowance: positionAllowance ? Number(parseNumber(positionAllowance)) : undefined,
                hazardAllowance: hazardAllowance ? Number(parseNumber(hazardAllowance)) : undefined,
                mealAllowance: mealAllowance ? Number(parseNumber(mealAllowance)) : undefined,
                mealAllowanceUnit,
                fuelAllowance: fuelAllowance ? Number(parseNumber(fuelAllowance)) : undefined,
                phoneAllowance: phoneAllowance ? Number(parseNumber(phoneAllowance)) : undefined,
                businessTripAllowance: businessTripAllowance ? Number(parseNumber(businessTripAllowance)) : undefined,
                otherAllowance: otherAllowance ? Number(parseNumber(otherAllowance)) : undefined,
                hasHealthInsurance,
                healthInsuranceRate: healthInsuranceRate ? Number(healthInsuranceRate) : undefined,
                hasSocialInsurance,
                socialInsuranceRate: socialInsuranceRate ? Number(socialInsuranceRate) : undefined,
                hasUnemploymentInsurance,
                unemploymentInsuranceRate: unemploymentInsuranceRate ? Number(unemploymentInsuranceRate) : undefined,
                hasUnionFee,
                unionFee: unionFee ? Number(parseNumber(unionFee)) : undefined,
                hasHealthCareInsurance,
                healthCareInsuranceCompany: healthCareInsuranceCompany || undefined,
                healthCareInsuranceBenefit: healthCareInsuranceBenefit ? Number(parseNumber(healthCareInsuranceBenefit)) : undefined,
                healthCareInsuranceRate: healthCareInsuranceRate ? Number(healthCareInsuranceRate) : undefined,
                leaveQuotaIds,
                hasFamilyDeduction,
                dependentsCount: dependentsCount ? Number(dependentsCount) : undefined,
                hasPersonalIncomeTax,
                personalIncomeTaxRate: personalIncomeTaxRate ? Number(personalIncomeTaxRate) : undefined,
                salaryType,
                netSalary: netSalary ? Number(parseNumber(netSalary)) : undefined,
                grossSalary: grossSalary ? Number(parseNumber(grossSalary)) : undefined,
            }
        };

        if (isEditMode && contractId) {
            await updateMutation.mutateAsync({ id: contractId, data: payload });
        } else {
            await createMutation.mutateAsync(payload);
        }
        onClose();
    }, [
        staffId, contractId, isEditMode,
        contractType, workType, jobTitle, position, duration, durationUnit,
        contractNumber, startDate, endDate, departmentId, roomId,
        directManagerIds, shiftType, fixedShiftId, workingDays, workingAreas,
        basicSalary, insuranceSalary, responsibilityAllowance, positionAllowance,
        hazardAllowance, mealAllowance, mealAllowanceUnit, fuelAllowance,
        phoneAllowance, businessTripAllowance, otherAllowance,
        hasHealthInsurance, healthInsuranceRate, hasSocialInsurance,
        socialInsuranceRate, hasUnemploymentInsurance, unemploymentInsuranceRate,
        hasUnionFee, unionFee, hasHealthCareInsurance, healthCareInsuranceCompany,
        healthCareInsuranceBenefit, healthCareInsuranceRate, leaveQuotaIds,
        hasFamilyDeduction, dependentsCount, hasPersonalIncomeTax,
        personalIncomeTaxRate, salaryType, netSalary, grossSalary,
        createMutation, updateMutation, onClose
    ]);

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Drawer
            isOpen={isOpen}
            onOpenChange={(open) => !open && onClose()}
            size="full"
            placement="right"
            classNames={{
                base: "bg-[#FAFAFA]",
            }}
        >
            <DrawerContent>
                {(onClose) => (
                    <>
                        <DrawerHeader className="flex items-center gap-2 border-b border-[#E4E4E7] bg-white py-4 px-6 z-10 sticky top-0 shadow-sm">
                            <h2 className="text-xl font-bold text-[#11181C]">
                                {isEditMode ? 'Chỉnh sửa hợp đồng' : 'Thêm mới hợp đồng'}
                            </h2>
                        </DrawerHeader>

                        <DrawerBody className="p-6 overflow-y-auto w-full">
                            {isDetailLoading ? (
                                <div className="flex h-full items-center justify-center">
                                    <div className="w-8 h-8 border-2 border-[#006FEE] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                                    {/* Cột Trái */}
                                    <div className="flex flex-col gap-6">
                                        {/* THÔNG TIN HỢP ĐỒNG */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <IconFileDescription size={20} className="text-[#11181C]" />
                                                <h3 className="text-[15px] font-bold text-[#11181C]">Thông tin hợp đồng</h3>
                                            </div>

                                            <div className="pr-12 flex flex-col gap-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Select
                                                        label="Loại hợp đồng"
                                                        labelPlacement="outside"
                                                        placeholder="Chọn"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        isRequired
                                                        selectedKeys={contractType ? [contractType] : []}
                                                        onSelectionChange={(keys) => setContractType(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="FULL_TIME">Nhân viên chính thức</SelectItem>
                                                        <SelectItem key="PROBATION">Thử việc</SelectItem>
                                                        <SelectItem key="INTERNSHIP">Học việc</SelectItem>
                                                        <SelectItem key="EXPERT_COOPERATION">Chuyên gia hợp tác</SelectItem>
                                                    </Select>
                                                    <Select
                                                        label="Loại hình"
                                                        labelPlacement="outside"
                                                        placeholder="Chọn"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        isRequired
                                                        selectedKeys={workType ? [workType] : []}
                                                        onSelectionChange={(keys) => setWorkType(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="FULL_TIME">Fulltime</SelectItem>
                                                        <SelectItem key="PART_TIME">Parttime</SelectItem>
                                                    </Select>

                                                    <Select
                                                        label="Chức danh"
                                                        labelPlacement="outside"
                                                        placeholder="Chọn"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        isRequired
                                                        selectedKeys={jobTitle ? [jobTitle] : []}
                                                        onSelectionChange={(keys) => setJobTitle(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="DOCTOR">Bác sĩ</SelectItem>
                                                        <SelectItem key="NURSE">Điều dưỡng</SelectItem>
                                                        <SelectItem key="TECHNICIAN">Kỹ thuật viên</SelectItem>
                                                        <SelectItem key="OFFICE_STAFF">Nhân viên văn phòng</SelectItem>
                                                        <SelectItem key="PHARMACIST">Dược sĩ</SelectItem>
                                                    </Select>
                                                    <Select
                                                        label="Cấp bậc"
                                                        labelPlacement="outside"
                                                        placeholder="Chọn"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        isRequired
                                                        selectedKeys={position ? [position] : []}
                                                        onSelectionChange={(keys) => setPosition(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="STAFF">Nhân viên</SelectItem>
                                                        <SelectItem key="HEAD_OF_DEPARTMENT">Trưởng khoa</SelectItem>
                                                        <SelectItem key="DEPUTY_HEAD_OF_DEPARTMENT">Phó khoa</SelectItem>
                                                        <SelectItem key="MANAGER">Trưởng phòng</SelectItem>
                                                        <SelectItem key="DEPUTY_MANAGER">Phó phòng</SelectItem>
                                                    </Select>

                                                    <Input
                                                        label="Thời hạn hợp đồng"
                                                        labelPlacement="outside"
                                                        placeholder="Nhập"
                                                        classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        isRequired
                                                        value={duration}
                                                        onValueChange={setDuration}
                                                        endContent={
                                                            <Dropdown>
                                                                <DropdownTrigger>
                                                                    <Button
                                                                        variant="bordered"
                                                                        className="h-8 min-w-[85px] border-[#E4E4E7] text-sm text-[#71717A] font-medium px-3 flex justify-between items-center rounded-lg bg-white transition-all hover:bg-gray-50"
                                                                        endContent={<IconChevronDown size={14} />}
                                                                    >
                                                                        {durationUnit === 'YEAR' ? 'Năm' : 'Tháng'}
                                                                    </Button>
                                                                </DropdownTrigger>
                                                                <DropdownMenu
                                                                    aria-label="Chọn đơn vị"
                                                                    disallowEmptySelection
                                                                    selectionMode="single"
                                                                    selectedKeys={new Set([durationUnit])}
                                                                    onSelectionChange={(keys) => setDurationUnit(Array.from(keys)[0] as string)}
                                                                >
                                                                    <DropdownItem key="YEAR">Năm</DropdownItem>
                                                                    <DropdownItem key="MONTH">Tháng</DropdownItem>
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        }
                                                    />
                                                    <Input
                                                        label="Số hợp đồng"
                                                        labelPlacement="outside"
                                                        classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        value={contractNumber}
                                                        onValueChange={setContractNumber}
                                                    />

                                                    <Input
                                                        type="date"
                                                        label="Ngày bắt đầu"
                                                        labelPlacement="outside"
                                                        classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        isRequired
                                                        value={startDate}
                                                        onValueChange={setStartDate}
                                                    />
                                                    <Input
                                                        type="date"
                                                        label="Ngày kết thúc"
                                                        labelPlacement="outside"
                                                        classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        isRequired
                                                        value={endDate}
                                                        onValueChange={setEndDate}
                                                    />

                                                    <Select
                                                        label="Khoa quản lý"
                                                        labelPlacement="outside"
                                                        placeholder="Chọn khoa"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        isRequired
                                                        selectedKeys={departmentId ? [departmentId] : []}
                                                        onSelectionChange={(keys) => setDepartmentId(Array.from(keys)[0] as string)}
                                                    >
                                                        {departments.map((d) => <SelectItem key={d.id}>{d.name}</SelectItem>)}
                                                    </Select>
                                                    <Select
                                                        label="Phòng quản lý"
                                                        labelPlacement="outside"
                                                        placeholder="Chọn phòng"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        selectedKeys={roomId ? [roomId] : []}
                                                        onSelectionChange={(keys) => setRoomId(Array.from(keys)[0] as string)}
                                                    >
                                                        {rooms.filter(r => !departmentId || r.department?.id === departmentId).map((r) => <SelectItem key={r.id}>{r.name}</SelectItem>)}
                                                    </Select>
                                                </div>

                                                {workingAreas.map((area, idx) => (
                                                    <div key={area.id} className="relative">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <Select
                                                                label="Khoa làm việc"
                                                                labelPlacement="outside"
                                                                placeholder="Chọn khoa"
                                                                classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                                isRequired
                                                                selectedKeys={area.departmentId ? [area.departmentId] : []}
                                                                onSelectionChange={(keys) => updateWorkingArea(area.id, 'departmentId', Array.from(keys)[0] as string)}
                                                            >
                                                                {departments.map((d) => <SelectItem key={d.id}>{d.name}</SelectItem>)}
                                                            </Select>
                                                            <Select
                                                                label="Phòng làm việc"
                                                                labelPlacement="outside"
                                                                placeholder="Chọn phòng"
                                                                classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                                selectedKeys={area.roomId ? [area.roomId] : []}
                                                                onSelectionChange={(keys) => updateWorkingArea(area.id, 'roomId', Array.from(keys)[0] as string)}
                                                            >
                                                                {rooms.filter(r => !area.departmentId || r.department?.id === area.departmentId).map((r) => <SelectItem key={r.id}>{r.name}</SelectItem>)}
                                                            </Select>
                                                        </div>
                                                        <Button
                                                            isIconOnly
                                                            variant="light"
                                                            className={`absolute -right-12 bottom-0 h-10 text-[#71717A] min-w-10 ${idx === 0 && workingAreas.length === 1 ? 'invisible' : ''}`}
                                                            onPress={() => removeWorkingArea(area.id)}
                                                        >
                                                            <IconTrash size={18} />
                                                        </Button>
                                                    </div>
                                                ))}

                                                <Button variant="light" color="primary" className="justify-start px-0 font-medium text-[14px] w-fit" startContent={<IconPlus size={16} />} onPress={addWorkingArea}>
                                                    Thêm mới
                                                </Button>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Select
                                                        label="Quản lý trực tiếp"
                                                        labelPlacement="outside"
                                                        placeholder="Chọn"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        isRequired
                                                        selectionMode="multiple"
                                                        selectedKeys={new Set(directManagerIds)}
                                                        onSelectionChange={(keys) => setDirectManagerIds(Array.from(keys) as string[])}
                                                    >
                                                        {managers.map((m) => (
                                                            <SelectItem key={m.id} textValue={`${m.code} - ${m.name}`}>
                                                                {m.code} - {m.name}
                                                            </SelectItem>
                                                        ))}
                                                    </Select>
                                                    <Select
                                                        label="Loại hình làm việc theo ca"
                                                        labelPlacement="outside"
                                                        placeholder="Chọn"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        isRequired
                                                        selectedKeys={shiftType ? [shiftType] : []}
                                                        onSelectionChange={(keys) => setShiftType(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="FIXED">Ca cố định</SelectItem>
                                                        <SelectItem key="FLEXIBLE">Ca linh hoạt</SelectItem>
                                                        <SelectItem key="SPLIT">Ca gãy</SelectItem>
                                                    </Select>

                                                    {shiftType === 'FIXED' && (
                                                        <Autocomplete
                                                            label="Ca làm việc"
                                                            isRequired
                                                            labelPlacement="outside"
                                                            placeholder="Tìm theo mã ca hoặc tên ca"
                                                            classNames={{ base: "w-full" }}
                                                            inputProps={{ classNames: { inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" } }}
                                                            selectedKey={fixedShiftId || undefined}
                                                            onSelectionChange={(key) => setFixedShiftId(key as string || '')}
                                                        >
                                                            <AutocompleteItem key="C1">Ca 1</AutocompleteItem>
                                                            <AutocompleteItem key="C2">Ca 2</AutocompleteItem>
                                                        </Autocomplete>
                                                    )}
                                                </div>
                                            </div>

                                            {shiftType === 'FIXED' && (
                                                <div className="flex flex-col mt-2 gap-2">
                                                    <label className="text-sm font-medium text-[#11181C] flex gap-1">Ngày làm việc <span className="text-danger">*</span></label>
                                                    <div className="flex flex-wrap gap-4">
                                                        {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, idx) => {
                                                            const dayValue = idx === 6 ? 0 : idx + 1;
                                                            return (
                                                                <Checkbox
                                                                    key={idx}
                                                                    isSelected={workingDays.includes(dayValue)}
                                                                    onValueChange={(checked) => {
                                                                        setWorkingDays((prev) =>
                                                                            checked ? [...prev, dayValue] : prev.filter((d) => d !== dayValue),
                                                                        );
                                                                    }}
                                                                    size="sm"
                                                                    classNames={{ label: "text-sm text-[#3F3F46]" }}
                                                                >
                                                                    {day}
                                                                </Checkbox>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* BẢO HIỂM VÀ CÔNG ĐOÀN */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-5">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IconShieldCheck size={20} className="text-[#11181C]" />
                                                <h3 className="text-[15px] font-bold text-[#11181C]">Bảo hiểm và công đoàn</h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="flex flex-col gap-2">
                                                    <Checkbox isSelected={hasHealthInsurance} onValueChange={setHasHealthInsurance} size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Bảo hiểm y tế</Checkbox>
                                                    <Input label="Tỷ lệ đóng" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">%</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={healthInsuranceRate} onValueChange={setHealthInsuranceRate} />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Checkbox isSelected={hasSocialInsurance} onValueChange={setHasSocialInsurance} size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Bảo hiểm xã hội</Checkbox>
                                                    <Input label="Tỷ lệ đóng" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">%</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={socialInsuranceRate} onValueChange={setSocialInsuranceRate} />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Checkbox isSelected={hasUnemploymentInsurance} onValueChange={setHasUnemploymentInsurance} size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Bảo hiểm thất nghiệp</Checkbox>
                                                    <Input label="Tỷ lệ đóng" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">%</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={unemploymentInsuranceRate} onValueChange={setUnemploymentInsuranceRate} />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <Checkbox isSelected={hasUnionFee} onValueChange={setHasUnionFee} size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Công đoàn</Checkbox>
                                                    <Input label="Mức đóng" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={unionFee} onValueChange={(v) => setUnionFee(formatNumber(v))} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* BẢO HIỂM SỨC KHOẺ */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IconHeartbeat size={20} className="text-[#11181C]" />
                                                <h3 className="text-[15px] font-bold text-[#11181C]">Bảo hiểm sức khỏe</h3>
                                            </div>

                                            <Checkbox isSelected={hasHealthCareInsurance} onValueChange={setHasHealthCareInsurance} size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Sử dụng bảo hiểm sức khỏe</Checkbox>

                                            <Input label="Tên công ty bảo hiểm" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={healthCareInsuranceCompany} onValueChange={setHealthCareInsuranceCompany} isDisabled={!hasHealthCareInsurance} />

                                            <div className="grid grid-cols-2 gap-4 mt-2">
                                                <Input label="Mức hưởng" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={healthCareInsuranceBenefit} onValueChange={(v) => setHealthCareInsuranceBenefit(formatNumber(v))} isDisabled={!hasHealthCareInsurance} />
                                                <Input label="Mức đóng (%)" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">%</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={healthCareInsuranceRate} onValueChange={setHealthCareInsuranceRate} isDisabled={!hasHealthCareInsurance} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cột Phải */}
                                    <div className="flex flex-col gap-6">
                                        {/* CẤU TRÚC LƯƠNG */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <IconCurrencyDollar size={20} className="text-[#11181C]" />
                                                <h3 className="text-[15px] font-bold text-[#11181C]">Cấu trúc lương</h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Input label="Lương cơ bản" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired value={basicSalary} onValueChange={(v) => setBasicSalary(formatNumber(v))} />
                                                <Input label="Lương đóng BHXH" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={insuranceSalary} onValueChange={(v) => setInsuranceSalary(formatNumber(v))} />

                                                <Input label="Phụ cấp trách nhiệm" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={responsibilityAllowance} onValueChange={(v) => setResponsibilityAllowance(formatNumber(v))} />
                                                <Input label="Phụ cấp chức vụ" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={positionAllowance} onValueChange={(v) => setPositionAllowance(formatNumber(v))} />

                                                <Input label="Phụ cấp độc hại, nguy hiểm" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={hazardAllowance} onValueChange={(v) => setHazardAllowance(formatNumber(v))} />
                                                <Input
                                                    label="Phụ cấp ăn ca"
                                                    labelPlacement="outside"
                                                    placeholder="Nhập"
                                                    endContent={
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[#a1a1aa] text-sm">VNĐ</span>
                                                            <Dropdown>
                                                                <DropdownTrigger>
                                                                    <Button
                                                                        variant="bordered"
                                                                        className="h-8 min-w-[85px] border-[#E4E4E7] text-sm text-[#71717A] font-medium px-3 flex justify-between items-center rounded-lg bg-white transition-all hover:bg-gray-50"
                                                                        endContent={<IconChevronDown size={14} />}
                                                                    >
                                                                        {mealAllowanceUnit === 'DAY' ? 'Ngày' : 'Tháng'}
                                                                    </Button>
                                                                </DropdownTrigger>
                                                                <DropdownMenu
                                                                    aria-label="Chọn đơn vị"
                                                                    disallowEmptySelection
                                                                    selectionMode="single"
                                                                    selectedKeys={new Set([mealAllowanceUnit])}
                                                                    onSelectionChange={(keys) => setMealAllowanceUnit(Array.from(keys)[0] as string)}
                                                                >
                                                                    <DropdownItem key="DAY">Ngày</DropdownItem>
                                                                    <DropdownItem key="MONTH">Tháng</DropdownItem>
                                                                </DropdownMenu>
                                                            </Dropdown>
                                                        </div>
                                                    }
                                                    classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                    value={mealAllowance}
                                                    onValueChange={(v) => setMealAllowance(formatNumber(v))}
                                                />

                                                <Input label="Phụ cấp xăng xe" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={fuelAllowance} onValueChange={(v) => setFuelAllowance(formatNumber(v))} />
                                                <Input label="Phụ cấp điện thoại" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={phoneAllowance} onValueChange={(v) => setPhoneAllowance(formatNumber(v))} />

                                                <Input label="Phụ cấp công tác" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={businessTripAllowance} onValueChange={(v) => setBusinessTripAllowance(formatNumber(v))} />
                                                <Input label="Phụ cấp khác" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={otherAllowance} onValueChange={(v) => setOtherAllowance(formatNumber(v))} />
                                            </div>
                                        </div>

                                        {/* THÔNG TIN LƯƠNG */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IconCurrencyDollar size={20} className="text-[#11181C]" />
                                                <h3 className="text-[15px] font-bold text-[#11181C]">Thông tin lương</h3>
                                            </div>

                                            <Select
                                                label="Loại lương"
                                                labelPlacement="outside"
                                                placeholder="Chọn"
                                                classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                isRequired
                                                selectedKeys={salaryType ? [salaryType] : []}
                                                onSelectionChange={(keys) => setSalaryType(Array.from(keys)[0] as string)}
                                            >
                                                <SelectItem key="GROSS">Lương Gross</SelectItem>
                                                <SelectItem key="NET">Lương Net</SelectItem>
                                            </Select>

                                            <div className="grid grid-cols-2 gap-x-4 gap-y-10 mt-8">
                                                <Input label="Lương net" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={netSalary} onValueChange={(v) => setNetSalary(formatNumber(v))} />
                                                <Input label="Lương gross" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">VNĐ</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={grossSalary} onValueChange={(v) => setGrossSalary(formatNumber(v))} />
                                            </div>
                                        </div>

                                        {/* NGHỈ PHÉP VÀ PHÚC LỢI */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IconBeach size={20} className="text-[#11181C]" />
                                                <h3 className="text-[15px] font-bold text-[#11181C]">Nghỉ phép và phúc lợi</h3>
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                <Checkbox size="sm" isSelected={leaveQuotaIds.includes('P1')} onValueChange={(sel) => setLeaveQuotaIds(prev => sel ? [...prev, 'P1'] : prev.filter(i => i !== 'P1'))} classNames={{ label: "text-[14px] text-[#3F3F46]" }}>Nghỉ phép năm</Checkbox>
                                                <Checkbox size="sm" isSelected={leaveQuotaIds.includes('P2')} onValueChange={(sel) => setLeaveQuotaIds(prev => sel ? [...prev, 'P2'] : prev.filter(i => i !== 'P2'))} classNames={{ label: "text-[14px] text-[#3F3F46]" }}>Nghỉ ngày đặc biệt</Checkbox>
                                                <Checkbox size="sm" isSelected={leaveQuotaIds.includes('P3')} onValueChange={(sel) => setLeaveQuotaIds(prev => sel ? [...prev, 'P3'] : prev.filter(i => i !== 'P3'))} classNames={{ label: "text-[14px] text-[#3F3F46]" }}>Nghỉ sinh nhật</Checkbox>
                                            </div>
                                        </div>

                                        {/* THUẾ TNCN */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <IconReceiptTax size={20} className="text-[#11181C]" />
                                                <h3 className="text-[15px] font-bold text-[#11181C]">Thuế TNCN</h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-6 mt-2">
                                                <div className="flex flex-col gap-2">
                                                    <Checkbox isSelected={hasFamilyDeduction} onValueChange={setHasFamilyDeduction} size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Giảm trừ gia cảnh</Checkbox>
                                                    <Input label="Số người phụ thuộc" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} value={dependentsCount} onValueChange={setDependentsCount} isDisabled={!hasFamilyDeduction} />
                                                </div>

                                                <div className="flex flex-col gap-2">
                                                    <Checkbox
                                                        isSelected={hasPersonalIncomeTax}
                                                        onValueChange={(val) => {
                                                            setHasPersonalIncomeTax(val);
                                                            if (!val) {
                                                                setPersonalIncomeTaxRate('');
                                                            }
                                                        }}
                                                        size="sm"
                                                        classNames={{ label: "text-sm font-semibold text-[#11181C]" }}
                                                    >
                                                        Thuế TNCN
                                                    </Checkbox>
                                                    <Input
                                                        label="Tỷ lệ (%)"
                                                        labelPlacement="outside"
                                                        placeholder="Nhập"
                                                        endContent={<span className="text-[#a1a1aa] text-sm">%</span>}
                                                        classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }}
                                                        value={personalIncomeTaxRate}
                                                        onValueChange={setPersonalIncomeTaxRate}
                                                        isDisabled={!hasPersonalIncomeTax}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}
                        </DrawerBody>

                        <DrawerFooter className="border-t border-[#E4E4E7] bg-white px-6 py-4 justify-end gap-3 sticky bottom-0 z-10">
                            <Button
                                variant="bordered"
                                className="bg-white border-[#E4E4E7] text-[#11181C] font-semibold h-10 px-6 rounded-xl shadow-sm"
                                onPress={onClose}
                                isDisabled={isPending}
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                color="primary"
                                className="bg-[#006FEE] text-white font-semibold h-10 px-6 rounded-xl shadow-sm"
                                onPress={handleSave}
                                isLoading={isPending}
                            >
                                Lưu lại
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
};
