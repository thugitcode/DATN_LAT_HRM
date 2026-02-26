import type { FC } from 'react';
import { Card, CardHeader, CardBody, Divider, Button, Textarea } from '@heroui/react';
import { IconPencil, IconUser, IconPhone, IconBriefcase, IconSchool, IconPlus, IconNotes } from '@tabler/icons-react';
import type { Staff } from '@/types/staff.type';

interface StaffDetailInfoProps {
    staff: Staff;
}

const InfoRow: FC<{ label: string; value: string | React.ReactNode }> = ({ label, value }) => (
    <div className="flex flex-col gap-1">
        <span className="text-xs text-[#71717A] uppercase font-medium">{label}</span>
        <div className="text-sm text-[#11181C] font-medium min-h-[1.25rem]">
            {value || '—'}
        </div>
    </div>
);

const InfoCard: FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <Card className="shadow-sm border border-[#F4F4F5] rounded-2xl overflow-hidden bg-white">
        <CardHeader className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#F4F4F5]">
            <div className="flex items-center gap-2">
                <div className="text-[#11181C]">{icon}</div>
                <h3 className="text-[15px] font-bold text-[#11181C]">{title}</h3>
            </div>
            <Button isIconOnly variant="flat" size="sm" className="bg-[#F4F4F5] rounded-lg min-w-8 w-8 h-8">
                <IconPencil size={18} className="text-[#11181C]" />
            </Button>
        </CardHeader>
        <CardBody className="p-6">
            {children}
        </CardBody>
    </Card>
);

export const StaffDetailInfo: FC<StaffDetailInfoProps> = ({ staff }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 pb-6">
            <div className="space-y-6">
                {/* Personnel Information */}
                <InfoCard title="Thông tin nhân sự" icon={<IconUser size={20} />}>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <InfoRow label="Mã nhân viên" value={staff.code} />
                        <InfoRow label="Tên nhân viên" value={staff.name} />
                        <InfoRow label="Ngày sinh" value={staff.birthday ? new Date(staff.birthday).toLocaleDateString('vi-VN') : '—'} />
                        <InfoRow label="Giới tính" value={staff.gender === 'MALE' ? 'Nam' : staff.gender === 'FEMALE' ? 'Nữ' : 'Khác'} />
                        <InfoRow label="Số CCCD/Passport" value={staff.identity} />
                        <InfoRow label="Ngày cấp" value={staff.identityIssueDate ? new Date(staff.identityIssueDate).toLocaleDateString('vi-VN') : '—'} />
                        <InfoRow label="Nơi cấp" value={staff.identityIssuePlace} />
                        <InfoRow label="Quốc tịch" value={staff.nationality} />
                        <div className="col-span-2">
                            <InfoRow label="Địa chỉ" value={staff.address} />
                        </div>
                    </div>
                </InfoCard>

                {/* Employment Information */}
                <InfoCard title="Thông tin công việc" icon={<IconBriefcase size={20} />}>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <InfoRow label="Khoa quản lý" value={<span className="text-[#006FEE]">{staff.departments?.map(d => d.name).join(', ') || '—'}</span>} />
                        <InfoRow label="Phòng quản lý" value={staff.rooms?.map(r => r.name).join(', ') || '—'} />
                        <InfoRow label="Chức danh" value={staff.jobTitle} />
                        <InfoRow label="Cấp bậc" value={staff.position} />
                        <InfoRow label="Loại hình hợp đồng" value={staff.currentContractType} />
                        <InfoRow label="Loại hình" value={staff.currentWorkType} />
                        <InfoRow label="Thời hạn làm việc" value="5 năm 2 tháng" /> {/* Placeholder as in screenshot */}
                    </div>
                </InfoCard>

                {/* Additional Information */}
                <InfoCard title="Thông tin bổ sung" icon={<IconPlus size={20} />}>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <InfoRow label="Mã số thuế" value={staff.taxCode} />
                        <InfoRow label="Số BHYT" value={staff.insuranceNumber} />
                        <InfoRow label="Số tài khoản" value={staff.accountNumber} />
                        <InfoRow label="Tên người thụ hưởng" value={staff.beneficiaryName} />
                        <InfoRow label="Tên ngân hàng" value={staff.bankName} />
                    </div>
                </InfoCard>
            </div>

            <div className="space-y-6">
                {/* Contact Information */}
                <InfoCard title="Thông tin liên hệ" icon={<IconPhone size={20} />}>
                    <div className="space-y-6">
                        <div>
                            <span className="text-[13px] font-semibold text-[#11181C]">Thông tin chính</span>
                            <div className="grid grid-cols-2 gap-4 mt-3">
                                <InfoRow label="Số điện thoại" value={<span className="text-[#006FEE]">{staff.phone}</span>} />
                                <InfoRow label="Email" value={<span className="text-[#006FEE]">{staff.email}</span>} />
                            </div>
                        </div>
                        <Divider className="bg-[#F4F4F5]" />
                        <div>
                            <span className="text-[13px] font-semibold text-[#11181C]">Thông tin liên hệ khẩn cấp</span>
                            <div className="flex flex-col items-center justify-center p-6 bg-[#FAFAFA] rounded-xl border border-dashed border-[#E4E4E7] mt-3">
                                <div className="w-10 h-10 bg-white shadow-sm border border-[#E4E4E7] rounded-lg flex items-center justify-center mb-2">
                                    <IconPlus size={20} className="text-[#71717A]" />
                                </div>
                                <span className="text-xs text-[#71717A]">Chưa cung cấp</span>
                            </div>
                        </div>
                    </div>
                </InfoCard>

                {/* Professional Qualifications */}
                <InfoCard title="Bảng cấp chuyên môn" icon={<IconSchool size={20} />}>
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <InfoRow label="Trình độ chuyên môn" value={staff.qualification} />
                        <InfoRow label="Chuyên ngành" value={staff.major} />
                        <InfoRow label="Học hàm, học vị" value={staff.academicTitles?.join(', ')} />
                        <InfoRow label="Số CCHN" value={staff.certificateNumber} />
                        <InfoRow label="Nơi cấp" value={staff.certificateIssuePlace} />
                        <InfoRow label="Ngày hết hạn" value={staff.certificateExpiryDate ? new Date(staff.certificateExpiryDate).toLocaleDateString('vi-VN') : '—'} />
                    </div>
                </InfoCard>

                {/* Notes */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <IconNotes size={20} className="text-[#11181C]" />
                        <h3 className="text-[15px] font-bold text-[#11181C]">Ghi chú</h3>
                    </div>
                    <Textarea
                        placeholder="Nhập ghi chú"
                        value={staff.note || ''}
                        classNames={{
                            inputWrapper: "bg-white border border-[#E4E4E7] shadow-sm rounded-2xl p-4",
                            input: "text-sm text-[#11181C]"
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
