import { type FC } from 'react';
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
} from '@heroui/react';
import {
    IconPencil,
    IconPlus,
    IconFileDescription,
    IconHistory,
    IconCheck,
    IconTrash,
} from '@tabler/icons-react';
import { useStaffContracts } from '@/query-options/staff-contract';
import { ContractStatusEnum } from '@/types/staff.type';
import dayjs from 'dayjs';
import { StaffContractFormDrawer } from './staff-contract-form-drawer';

interface StaffContractInfoProps {
    staffId: string;
}

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
    const titles: Record<string, string> = {
        DOCTOR: 'Bác sĩ',
        NURSE: 'Điều dưỡng',
        TECHNICIAN: 'Kỹ thuật viên',
        MIDWIFE: 'Hộ sinh',
        PHYSICIAN_ASSISTANT: 'Y sĩ',
        OFFICE_STAFF: 'Nhân viên văn phòng',
        MANAGEMENT: 'Quản lý',
        LAB_TECHNICIAN: 'Kỹ thuật viên xét nghiệm',
        IMAGING_TECHNICIAN: 'Kỹ thuật viên chẩn đoán hình ảnh',
        CASHIER: 'Thu ngân',
        RECEPTIONIST: 'Lễ tân',
        WAREHOUSE_KEEPER: 'Thủ kho',
        PHARMACIST: 'Dược sĩ',
        SALES: 'Sale',
        TELESALES: 'Telesale',
        MARKETING: 'Marketing',
        CUSTOMER_SUPPORT: 'Chăm sóc khách hàng',
        MARKETING_LEAD: 'Trưởng nhóm marketing',
        CUSTOMER_SUPPORT_LEAD: 'Trưởng nhóm CSKH',
    };
    return titles[title] || title || '—';
};

const translatePosition = (position: string) => {
    const positions: Record<string, string> = {
        STAFF: 'Nhân viên',
        HEAD_OF_DEPARTMENT: 'Trưởng khoa',
        DEPUTY_HEAD_OF_DEPARTMENT: 'Phó khoa',
        CHIEF_NURSE: 'Điều dưỡng trưởng',
        MANAGER: 'Trưởng phòng',
        HEAD_OF_UNIT: 'Trưởng bộ phận',
        DEPUTY_MANAGER: 'Phó phòng',
    };
    return positions[position] || position || '—';
};

const getStatusChip = (status: ContractStatusEnum) => {
    switch (status) {
        case ContractStatusEnum.PENDING_APPROVAL:
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    className="bg-[#FFF7ED] text-[#EA580C] border-none font-medium text-xs px-2"
                >
                    CHỜ DUYỆT
                </Chip>
            );
        case ContractStatusEnum.PENDING_SIGNATURE:
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    className="bg-[#EFF6FF] text-[#006FEE] border-none font-medium text-xs px-2"
                >
                    CHỜ KÝ
                </Chip>
            );
        case ContractStatusEnum.SIGNED:
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    className="bg-[#F0FDF4] text-[#16A34A] border-none font-medium text-xs px-2"
                >
                    ĐÃ KÝ
                </Chip>
            );
        case ContractStatusEnum.EXPIRED:
            return (
                <Chip
                    size="sm"
                    variant="flat"
                    className="bg-[#FEF2F2] text-[#DC2626] border-none font-medium text-xs px-2"
                >
                    HẾT HẠN
                </Chip>
            );
        default:
            return null;
    }
};

const InfoRow = ({ label, value }: { label: string; value: any }) => (
    <div className="flex flex-col gap-1.5">
        <span className="text-[12px] text-[#71717A] uppercase font-semibold">
            {label}
        </span>
        <span className="text-[14px] text-[#11181C] font-semibold">
            {value || '—'}
        </span>
    </div>
);

export const StaffContractInfo: FC<StaffContractInfoProps> = ({ staffId }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { data: response, isLoading } = useStaffContracts(staffId);
    const contracts = response?.data || [];
    const currentContract = contracts.find(c => c.status === ContractStatusEnum.SIGNED) || contracts[0];

    if (isLoading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <div className="w-8 h-8 border-2 border-[#006FEE] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-4">
            {/* Contract Details */}
            <Card className="shadow-none border border-[#F4F4F5] rounded-2xl overflow-hidden bg-white">
                <CardHeader className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#F4F4F5]">
                    <div className="flex items-center gap-2">
                        <IconFileDescription size={20} className="text-[#11181C]" />
                        <h3 className="text-[16px] font-bold text-[#11181C]">
                            Thông tin hợp đồng
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="flat"
                            size="sm"
                            startContent={<IconPencil size={18} />}
                            className="bg-[#F4F4F5] text-[#11181C] font-semibold h-9 rounded-xl px-4"
                        >
                            Chỉnh sửa
                        </Button>
                        <Button
                            color="primary"
                            size="sm"
                            startContent={<IconPlus size={18} />}
                            className="bg-[#006FEE] text-white font-semibold h-9 rounded-xl px-4"
                            onPress={onOpen}
                        >
                            Thêm mới hợp đồng
                        </Button>
                    </div>
                </CardHeader>
                <CardBody className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                        <InfoRow
                            label="Loại hợp đồng"
                            value={translateContractType(currentContract?.contractType as string)}
                        />
                        <InfoRow
                            label="Loại hình"
                            value={translateWorkType(currentContract?.workType as string)}
                        />
                        <InfoRow
                            label="Chức danh"
                            value={translateJobTitle(currentContract?.jobTitle as string)}
                        />
                        <InfoRow
                            label="Cấp bậc"
                            value={translatePosition(currentContract?.position as string)}
                        />
                        <InfoRow
                            label="Thời hạn hợp đồng"
                            value={
                                currentContract
                                    ? `${currentContract.duration} ${currentContract.durationUnit === 'YEAR' ? 'năm' : 'tháng'}`
                                    : ''
                            }
                        />
                        <InfoRow
                            label="Ngày bắt đầu"
                            value={
                                currentContract?.startDate
                                    ? dayjs(currentContract.startDate).format('DD/MM/YYYY')
                                    : ''
                            }
                        />
                        <InfoRow
                            label="Ngày kết thúc"
                            value={
                                currentContract?.endDate
                                    ? dayjs(currentContract.endDate).format('DD/MM/YYYY')
                                    : ''
                            }
                        />
                        <InfoRow label="Số hợp đồng" value={currentContract?.contractNumber} />
                        <InfoRow label="Khoa quản lý" value={currentContract?.department?.name} />
                        <InfoRow label="Phòng quản lý" value="—" />
                        <InfoRow label="Khoa làm việc" value={currentContract?.department?.name} />
                        <InfoRow label="Phòng làm việc" value="—" />
                        <InfoRow label="Quản lý trực tiếp" value="—" />
                        <InfoRow label="Loại hình làm việc theo ca" value={currentContract?.shiftType || '—'} />
                        <InfoRow label="Địa điểm làm việc" value="—" />
                        <InfoRow label="Thời gian làm việc" value="—" />
                        <div className="col-span-1 md:col-span-2">
                            <InfoRow label="Ngày làm việc" value={currentContract?.workingDays?.map(d => `Thứ ${d}`).join(', ') || '—'} />
                        </div>
                    </div>
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
                        base: "shadow-none border border-[#F4F4F5] rounded-2xl overflow-hidden bg-white",
                        thead: "bg-[#F8FAFC]",
                        th: "bg-[#F8FAFC] text-[#71717A] font-bold text-[13px] border-b border-[#F4F4F5] h-12 uppercase",
                        td: "py-4 text-[14px] text-[#11181C] border-b border-[#F4F4F5]"
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
                        <TableColumn>NGÀY BẮT ĐẦU</TableColumn>
                        <TableColumn>NGÀY KẾT THÚC</TableColumn>
                        <TableColumn>TRẠNG THÁI</TableColumn>
                        <TableColumn align="center">HÀNH ĐỘNG</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="Chưa có dữ liệu lịch sử làm việc">
                        {contracts.map((contract) => (
                            <TableRow key={contract.id}>
                                <TableCell>#123456</TableCell>
                                <TableCell>Nguyễn Văn A</TableCell>
                                <TableCell>{translateJobTitle(contract.jobTitle)}</TableCell>
                                <TableCell>{translatePosition(contract.position)}</TableCell>
                                <TableCell>{contract.department?.name || '—'}</TableCell>
                                <TableCell>{translateContractType(contract.contractType)}</TableCell>
                                <TableCell>{translateWorkType(contract.workType)}</TableCell>
                                <TableCell>{contract.duration} {contract.durationUnit === 'YEAR' ? 'năm' : 'tháng'}</TableCell>
                                <TableCell>{dayjs(contract.startDate).format('DD/MM/YYYY')}</TableCell>
                                <TableCell>{dayjs(contract.endDate).format('DD/MM/YYYY')}</TableCell>
                                <TableCell>{getStatusChip(contract.status)}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center gap-1">
                                        {contract.status === ContractStatusEnum.PENDING_APPROVAL && (
                                            <Button isIconOnly size="sm" variant="light" title="Duyệt">
                                                <IconCheck size={18} className="text-[#006FEE]" />
                                            </Button>
                                        )}
                                        <Button isIconOnly size="sm" variant="light" title="Xóa">
                                            <IconTrash size={18} className="text-[#F31260]" />
                                        </Button>
                                        <Button isIconOnly size="sm" variant="light">
                                            <IconPencil size={18} className="text-[#71717A]" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <StaffContractFormDrawer
                isOpen={isOpen}
                onClose={onClose}
                staffId={staffId}
            />
        </div>
    );
};
