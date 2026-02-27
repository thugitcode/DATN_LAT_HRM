import type { FC } from 'react';
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
    RadioGroup,
    Radio,
    Divider,
} from '@heroui/react';
import {
    IconFileDescription,
    IconCurrencyDollar,
    IconHeartbeat,
    IconBeach,
    IconReceiptTax,
    IconShieldCheck,
    IconBuildingHospital,
    IconPlus,
    IconTrash
} from '@tabler/icons-react';

interface StaffContractFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    staffId: string;
}

export const StaffContractFormDrawer: FC<StaffContractFormDrawerProps> = ({
    isOpen,
    onClose,
    staffId,
}) => {
    return (
        <Drawer
            isOpen={isOpen}
            onOpenChange={(open) => !open && onClose()}
            size="5xl"
            placement="right"
            classNames={{
                base: "bg-[#FAFAFA]",
            }}
        >
            <DrawerContent>
                {(onClose) => (
                    <>
                        <DrawerHeader className="flex items-center gap-2 border-b border-[#E4E4E7] bg-white py-4 px-6 z-10 sticky top-0 shadow-sm">
                            <h2 className="text-xl font-bold text-[#11181C]">Thêm mới hợp đồng</h2>
                        </DrawerHeader>

                        <DrawerBody className="p-6 overflow-y-auto w-full">
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                                {/* Cột Trái */}
                                <div className="flex flex-col gap-6">
                                    {/* THÔNG TIN HỢP ĐỒNG */}
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <IconFileDescription size={20} className="text-[#11181C]" />
                                            <h3 className="text-[15px] font-bold text-[#11181C]">Thông tin hợp đồng</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Select label="Loại hợp đồng" labelPlacement="outside" placeholder="Hợp tác" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired>
                                                <SelectItem key="HT">Hợp tác</SelectItem>
                                            </Select>
                                            <Select label="Loại hình" labelPlacement="outside" placeholder="Fulltime" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired>
                                                <SelectItem key="FT">Fulltime</SelectItem>
                                            </Select>

                                            <Select label="Chức danh" labelPlacement="outside" placeholder="Bác sĩ" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired>
                                                <SelectItem key="BS">Bác sĩ</SelectItem>
                                            </Select>
                                            <Select label="Cấp bậc" labelPlacement="outside" placeholder="Nhân viên" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired>
                                                <SelectItem key="NV">Nhân viên</SelectItem>
                                            </Select>

                                            <div className="flex items-end gap-2">
                                                <Input label="Thời hạn hợp đồng" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none flex-1" }} isRequired />
                                                <Select defaultSelectedKeys={["Năm"]} className="w-[100px]" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} aria-label="Đơn vị">
                                                    <SelectItem key="Năm">Năm</SelectItem>
                                                    <SelectItem key="Tháng">Tháng</SelectItem>
                                                </Select>
                                            </div>
                                            <Input label="Số hợp đồng" labelPlacement="outside" defaultValue="2336365" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />

                                            <Input type="date" label="Ngày bắt đầu" labelPlacement="outside" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired />
                                            <Input type="date" label="Ngày kết thúc" labelPlacement="outside" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <Select label="Khoa quản lý" labelPlacement="outside" placeholder="Phụ sản" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired>
                                                <SelectItem key="PS">Phụ sản</SelectItem>
                                            </Select>
                                            <Select label="Phòng quản lý" labelPlacement="outside" placeholder="Phụ sản" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}>
                                                <SelectItem key="PS">Phụ sản</SelectItem>
                                            </Select>
                                        </div>

                                        <div className="flex items-end gap-2 mt-2">
                                            <div className="grid grid-cols-2 gap-4 flex-1">
                                                <Select label="Khoa làm việc" labelPlacement="outside" placeholder="Khoa Phụ Sản" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired>
                                                    <SelectItem key="PS">Khoa Phụ Sản</SelectItem>
                                                </Select>
                                                <Select label="Phòng làm việc" labelPlacement="outside" placeholder="Phòng CĐHA" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }}>
                                                    <SelectItem key="CDHA">Phòng CĐHA</SelectItem>
                                                </Select>
                                            </div>
                                            <Button isIconOnly variant="light" className="h-10 text-[#71717A] min-w-10">
                                                <IconTrash size={18} />
                                            </Button>
                                        </div>

                                        <Button variant="light" color="primary" className="justify-start px-0 font-medium text-[14px] w-fit" startContent={<IconPlus size={16} />}>
                                            Thêm mới
                                        </Button>

                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <Select label="Quản lý trực tiếp" labelPlacement="outside" placeholder="Chọn" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired>
                                                <SelectItem key="MGR">Manager</SelectItem>
                                            </Select>
                                            <Select label="Loại hình làm việc theo ca" labelPlacement="outside" placeholder="Chọn" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired>
                                                <SelectItem key="CA">Theo ca</SelectItem>
                                            </Select>

                                            <Select label="Ca làm việc" labelPlacement="outside" placeholder="Chọn" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired>
                                                <SelectItem key="C1">Ca 1</SelectItem>
                                            </Select>

                                            <div className="flex items-end gap-2">
                                                <Input label="Thời gian làm việc" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none flex-1" }} />
                                                <Select defaultSelectedKeys={["Ngày"]} className="w-[100px]" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} aria-label="Đơn vị thời gian">
                                                    <SelectItem key="Ngày">Ngày</SelectItem>
                                                    <SelectItem key="Giờ">Giờ</SelectItem>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="flex flex-col mt-2 gap-2">
                                            <label className="text-sm font-medium text-[#11181C] flex gap-1">Ngày làm việc <span className="text-danger">*</span></label>
                                            <div className="flex flex-wrap gap-4">
                                                {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'].map((day, idx) => (
                                                    <Checkbox key={idx} defaultSelected={idx < 5} size="sm" classNames={{ label: "text-sm text-[#3F3F46]" }}>
                                                        {day}
                                                    </Checkbox>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* BẢO HIỂM VÀ CÔNG ĐOÀN */}
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <IconShieldCheck size={20} className="text-[#11181C]" />
                                            <h3 className="text-[15px] font-bold text-[#11181C]">Bảo hiểm và công đoàn</h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="flex flex-col gap-2">
                                                <Checkbox defaultSelected size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Bảo hiểm y tế</Checkbox>
                                                <Input label="Tỷ lệ đóng" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">%</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Checkbox defaultSelected size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Bảo hiểm xã hội</Checkbox>
                                                <Input label="Tỷ lệ đóng" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">%</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Checkbox defaultSelected size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Bảo hiểm thất nghiệp</Checkbox>
                                                <Input label="Tỷ lệ đóng" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">%</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Checkbox defaultSelected size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Công đoàn</Checkbox>
                                                <Input label="Mức đóng" labelPlacement="outside" placeholder="Nhập" endContent={<span className="text-[#a1a1aa] text-sm">%</span>} classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* BẢO HIỂM SỨC KHOẺ */}
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <IconHeartbeat size={20} className="text-[#11181C]" />
                                            <h3 className="text-[15px] font-bold text-[#11181C]">Bảo hiểm sức khỏe</h3>
                                        </div>

                                        <Input label="Tên công ty bảo hiểm" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />

                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <Input label="Mức hưởng" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            <Input label="Mức đóng" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
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
                                            <Input label="Lương cơ bản" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired />
                                            <Input label="Lương đóng BHXH" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />

                                            <Input label="Phụ cấp trách nhiệm" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            <Input label="Phụ cấp chức vụ" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />

                                            <Input label="Phụ cấp độc hại, nguy hiểm" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            <div className="flex items-end gap-2">
                                                <Input label="Phụ cấp ăn ca" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none flex-1" }} />
                                                <Select defaultSelectedKeys={["Ngày"]} className="w-[85px]" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} aria-label="Đơn vị phụ cấp">
                                                    <SelectItem key="Ngày">Ngày</SelectItem>
                                                    <SelectItem key="Tháng">Tháng</SelectItem>
                                                </Select>
                                            </div>

                                            <Input label="Phụ cấp xăng xe" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            <Input label="Phụ cấp điện thoại" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />

                                            <Input label="Phụ cấp công tác" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            <Input label="Phụ cấp khác" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                        </div>
                                    </div>

                                    {/* THÔNG TIN LƯƠNG */}
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <IconCurrencyDollar size={20} className="text-[#11181C]" />
                                            <h3 className="text-[15px] font-bold text-[#11181C]">Thông tin lương</h3>
                                        </div>

                                        <Select label="Loại lương" labelPlacement="outside" placeholder="Chọn" classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none" }} isRequired>
                                            <SelectItem key="GROSS">Lương Gross</SelectItem>
                                            <SelectItem key="NET">Lương Net</SelectItem>
                                        </Select>

                                        <div className="grid grid-cols-2 gap-4 mt-2">
                                            <Input label="Lương net" labelPlacement="outside" placeholder="" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            <Input label="Lương gross" labelPlacement="outside" placeholder="" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                        </div>
                                    </div>

                                    {/* NGHỈ PHÉP VÀ PHÚC LỢI */}
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <IconBeach size={20} className="text-[#11181C]" />
                                            <h3 className="text-[15px] font-bold text-[#11181C]">Nghỉ phép và phúc lợi</h3>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <Checkbox size="sm" classNames={{ label: "text-[14px] text-[#3F3F46]" }}>Nghỉ phép năm</Checkbox>
                                            <Checkbox defaultSelected size="sm" classNames={{ label: "text-[14px] text-[#3F3F46]" }}>Nghỉ ngày đặc biệt</Checkbox>
                                            <Checkbox defaultSelected size="sm" classNames={{ label: "text-[14px] text-[#3F3F46]" }}>Nghỉ sinh nhật</Checkbox>
                                            <Checkbox size="sm" classNames={{ label: "text-[14px] text-[#3F3F46]" }}>Nghỉ làm kỳ sinh nguyệt</Checkbox>
                                        </div>
                                    </div>

                                    {/* THUẾ TNCN */}
                                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#E4E4E7] flex flex-col gap-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <IconReceiptTax size={20} className="text-[#11181C]" />
                                            <h3 className="text-[15px] font-bold text-[#11181C]">Thuế TNCN</h3>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="space-y-3">
                                                <Checkbox defaultSelected size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Giảm trừ gia cảnh</Checkbox>
                                                <Input label="Số người phụ thuộc" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            </div>

                                            <div className="space-y-3 mt-2">
                                                <Checkbox defaultSelected size="sm" classNames={{ label: "text-sm font-semibold text-[#11181C]" }}>Thuế TNCN</Checkbox>
                                                <Input label="Mức đóng" labelPlacement="outside" placeholder="Nhập" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none" }} />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </DrawerBody>

                        <DrawerFooter className="border-t border-[#E4E4E7] bg-white px-6 py-4 justify-end gap-3 sticky bottom-0 z-10">
                            <Button
                                variant="bordered"
                                className="bg-white border-[#E4E4E7] text-[#11181C] font-semibold h-10 px-6 rounded-xl shadow-sm"
                                onPress={onClose}
                            >
                                Hủy bỏ
                            </Button>
                            <Button
                                color="primary"
                                className="bg-[#006FEE] text-white font-semibold h-10 px-6 rounded-xl shadow-sm"
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
