import {
    Drawer, DrawerContent, DrawerHeader, DrawerBody, DrawerFooter,
    Input, Select, SelectItem, Button, Avatar,
    Textarea
} from "@heroui/react";
import {
    IconCamera, IconUser, IconSchool,
    IconFileDescription,
    IconLayoutGrid, IconPhone, IconMessage2
} from "@tabler/icons-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useDepartmentOptions } from "@/hooks/select-options/use-department-options";
import { useRoomOptions } from "@/hooks/select-options/use-room-options";
// Enum imports removed as they are now used via strings or not at all in this component's logic
import type { Staff } from "@/types/staff.type";
import { useCreateStaff, useUpdateStaff } from "@/query-options/staff";
import { useEffect } from "react";
import dayjs from "dayjs";

const FORM_DEFAULT_VALUES = {
    code: "",
    name: "",
    birthday: "",
    gender: "MALE",
    identity: "",
    identityIssueDate: "",
    identityIssuePlace: "",
    nationality: "Việt Nam",
    address: "",
    departmentIds: [],
    roomIds: [],
    workType: "FULL_TIME",
    jobTitle: "",
    position: "",
    contractType: "FULL_TIME",
    contractDuration: "",
    taxCode: "",
    insuranceNumber: "",
    accountNumber: "",
    beneficiaryName: "",
    bankName: "",
    phone: "",
    email: "",
    emergencyContact: "",
    emergencyContactPhone: "",
    emergencyContactAddress: "",
    emergencyContactRelationship: "",
    qualification: "",
    major: "",
    academicTitles: [],
    certificateNumber: "",
    certificateIssuePlace: "",
    certificateExpiryDate: "",
    note: "",
};

const staffSchema = z.object({
    code: z.string().min(1, "Bắt buộc"),
    name: z.string().min(1, "Bắt buộc").max(100, "Tối đa 100 ký tự"),
    birthday: z.string()
        .min(1, "Bắt buộc")
        .refine((val) => {
            if (!val) return true;
            const date = new Date(val);
            const now = new Date();
            return date < now;
        }, { message: "ngày sinh phải nhỏ hơn ngày hiện tại." })
        .refine((val) => {
            if (!val) return true;
            const date = new Date(val);
            const now = new Date();
            let age = now.getFullYear() - date.getFullYear();
            const m = now.getMonth() - date.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < date.getDate())) {
                age -= 1;
            }
            return age >= 18;
        }, { message: "Yêu cầu ngày sinh lớn hơn hoặc bằng 18 tuổi." }),
    gender: z.string().min(1, "Bắt buộc"),
    identity: z.string().optional().or(z.literal("")),
    identityIssueDate: z.string().optional().or(z.literal("")).refine((val) => {
        if (!val) return true;
        return new Date(val) <= new Date();
    }, { message: "Không được phép nhập ngày tương lai" }),
    identityIssuePlace: z.string().optional().or(z.literal("")),
    nationality: z.string().optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),

    departmentIds: z.array(z.string()).min(1, "Bắt buộc"),
    roomIds: z.array(z.string()).min(1, "Bắt buộc"),
    workType: z.string().optional().or(z.literal("")),
    jobTitle: z.string().min(1, "Bắt buộc"),
    position: z.string().min(1, "Bắt buộc"),
    contractType: z.string().min(1, "Bắt buộc"),
    contractDuration: z.string().optional().or(z.literal("")),

    taxCode: z.string().optional().or(z.literal("")).refine((val) => !val || /^\d{10}$/.test(val), "Mã số thuế phải là 10 số"),
    insuranceNumber: z.string().optional().or(z.literal("")).refine((val) => !val || /^\d{10}$/.test(val), "Số BHYT phải là 10 số"),
    accountNumber: z.string().optional().or(z.literal("")),
    beneficiaryName: z.string().optional().or(z.literal("")),
    bankName: z.string().optional().or(z.literal("")),

    phone: z.string()
        .min(1, "Bắt buộc")
        .regex(/^\d{10}$/, "Sai định dạng."),
    email: z.string()
        .min(1, "Bắt buộc")
        .email("Sai định dạng."),
    emergencyContact: z.string().optional().or(z.literal("")),
    emergencyContactPhone: z.string().optional().or(z.literal("")).refine((val) => !val || /^\d{10}$/.test(val), "Sai định dạng."),
    emergencyContactAddress: z.string().optional().or(z.literal("")),
    emergencyContactRelationship: z.string().optional().or(z.literal("")),

    qualification: z.string().min(1, "Bắt buộc"),
    major: z.string().optional().or(z.literal("")),
    academicTitles: z.array(z.string()).optional(),
    certificateNumber: z.string().optional().or(z.literal("")),
    certificateIssuePlace: z.string().optional().or(z.literal("")),
    certificateExpiryDate: z.string().optional().or(z.literal("")).refine((val) => {
        if (!val) return true;
        return new Date(val) > new Date();
    }, { message: "Nhập thời gian trong tương lai" }),

    note: z.string().optional().or(z.literal("")),
});

type StaffFormValues = z.infer<typeof staffSchema>;

interface StaffFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    editData?: Staff;
}

export const StaffFormDrawer = ({ isOpen, onClose, editData }: StaffFormDrawerProps) => {
    const { options: departmentOptions } = useDepartmentOptions();
    const { mutateAsync: createStaff, isPending } = useCreateStaff();
    const { mutateAsync: updateStaff, isPending: isUpdating } = useUpdateStaff();

    const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema),
        defaultValues: FORM_DEFAULT_VALUES
    });

    const selectedDepts = watch("departmentIds");
    const { options: roomOptions } = useRoomOptions(selectedDepts);

    useEffect(() => {
        if (isOpen) {
            if (editData) {
                const formatDate = (date?: string) => date ? dayjs(date).format("YYYY-MM-DD") : "";

                reset({
                    ...FORM_DEFAULT_VALUES,
                    code: editData.code || "",
                    name: editData.name || "",
                    birthday: formatDate(editData.birthday),
                    gender: editData.gender || "MALE",
                    identity: editData.identity || "",
                    identityIssueDate: formatDate(editData.identityIssueDate),
                    identityIssuePlace: editData.identityIssuePlace || "",
                    nationality: editData.nationality || "Việt Nam",
                    address: editData.address || "",
                    departmentIds: editData.rlsStaffDepartments?.map(rd => rd.department.id)
                        || editData.departments?.map(d => d.id)
                        || [],
                    roomIds: editData.rlsStaffRooms?.map(rr => rr.room.id)
                        || editData.rooms?.map(r => r.id)
                        || [],
                    workType: editData.currentWorkType || editData.workType || "FULL_TIME",
                    jobTitle: editData.jobTitle || "",
                    position: editData.position as string || "",
                    contractType: editData.currentContractType || "FULL_TIME",
                    taxCode: editData.taxCode || "",
                    insuranceNumber: editData.insuranceNumber || "",
                    accountNumber: editData.accountNumber || "",
                    beneficiaryName: editData.beneficiaryName || "",
                    bankName: editData.bankName || "",
                    phone: editData.phone || "",
                    email: editData.email || "",
                    emergencyContact: editData.emergencyContact || "",
                    emergencyContactPhone: editData.emergencyContactPhone || "",
                    emergencyContactAddress: editData.emergencyContactAddress || "",
                    emergencyContactRelationship: editData.emergencyContactRelationship || "",
                    qualification: editData.qualification || "",
                    major: editData.major || "",
                    academicTitles: editData.academicTitles || [],
                    certificateNumber: editData.certificateNumber || "",
                    certificateIssuePlace: editData.certificateIssuePlace || "",
                    certificateExpiryDate: formatDate(editData.certificateExpiryDate),
                    note: editData.note || "",
                });
            } else {
                reset(FORM_DEFAULT_VALUES);
            }
        }
    }, [isOpen, editData, reset]);

    const onSubmit = async (data: StaffFormValues) => {
        const cleanedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                value === "" ? undefined : value
            ])
        );

        try {
            if (editData?.id) {
                await updateStaff({ id: editData.id, data: cleanedData as any });
            } else {
                await createStaff(cleanedData as any);
            }
            onClose();
        } catch (error) {
            console.error("Staff Form Error:", error);
        }
    };

    const onInvalid = (errors: any) => {
        console.error("Staff Form Validation Errors:", errors);
    };

    const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
        <div className="flex items-center gap-2 mb-4">
            <div className="bg-[#F4F4F5] p-1.5 rounded-lg text-[#11181C]">
                <Icon size={18} />
            </div>
            <h3 className="font-semibold text-sm text-[#11181C] uppercase tracking-wider">{title}</h3>
        </div>
    );

    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            classNames={{
                base: "bg-[#F4F4F5]",
                header: "border-b bg-white border-[#E4E4E7] py-4",
                body: "bg-[#F4F4F5] p-0",
                footer: "border-t bg-white border-[#E4E4E7] p-4 gap-3",
            }}
        >
            <DrawerContent>
                {(handleClose) => (
                    <>
                        <DrawerHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">{editData ? "Cập nhật thông tin nhân viên" : "Thêm mới nhân viên"}</h2>
                        </DrawerHeader>
                        <DrawerBody className="overflow-y-auto cursor-default">
                            <form id="staff-form" onSubmit={handleSubmit(onSubmit, onInvalid)} className="p-6 grid grid-cols-12 gap-6">
                                {/* Left Column */}
                                <div className="col-span-12 md:col-span-12 mb-6">
                                    <div className="relative inline-block group">
                                        <Avatar
                                            className="w-24 h-24 text-large bg-[#E4E4E7] border-2 border-white shadow-md"
                                            fallback={<IconUser size={40} className="text-[#A1A1AA]" />}
                                        />
                                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 rounded-full min-w-8 h-8 bg-primary text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-600 transition-colors">
                                            <IconCamera size={16} />
                                            <input
                                                id="avatar-upload"
                                                type="file"
                                                className="hidden"
                                                accept="image/png, image/jpeg, image/jpg"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file && file.size > 15 * 1024 * 1024) {
                                                        alert("Dung lượng file tối đa 15MB");
                                                        return;
                                                    }
                                                    // Handle file upload
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <p className="text-[10px] text-[#A1A1AA] mt-2 italic">* JPG, JPEG, PNG. Tối đa 15MB (180x180 px)</p>
                                </div>

                                <div className="col-span-12 lg:col-span-7 space-y-6">
                                    {/* Section: Personnel Info */}
                                    <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                                        <SectionHeader icon={IconUser} title="Thông tin nhân sự" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Controller
                                                name="code"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Mã nhân viên" placeholder="Nhập mã nhân viên" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} isInvalid={!!errors.code} errorMessage={errors.code?.message} />
                                                )}
                                            />
                                            <Controller
                                                name="name"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Tên nhân viên" labelPlacement="outside" placeholder="Nhập tên nhân viên" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} isRequired isInvalid={!!errors.name} errorMessage={errors.name?.message} />
                                                )}
                                            />
                                            <Controller
                                                name="birthday"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="date" label="Ngày sinh" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} isRequired isInvalid={!!errors.birthday} errorMessage={errors.birthday?.message} />
                                                )}
                                            />
                                            <Controller
                                                name="gender"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Giới tính"
                                                        labelPlacement="outside"
                                                        variant="flat"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none", value: "text-sm" }}
                                                        isRequired
                                                        isInvalid={!!errors.gender}
                                                        errorMessage={errors.gender?.message}
                                                        selectedKeys={field.value ? [field.value] : []}
                                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="MALE">Nam</SelectItem>
                                                        <SelectItem key="FEMALE">Nữ</SelectItem>
                                                        <SelectItem key="OTHER">Khác</SelectItem>
                                                    </Select>
                                                )}
                                            />
                                            <Controller
                                                name="identity"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Số CCCD/Passport" placeholder="Nhập số CCCD/Passport" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                )}
                                            />
                                            <Controller
                                                name="identityIssueDate"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="date" label="Ngày cấp" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                )}
                                            />
                                            <Controller
                                                name="identityIssuePlace"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Nơi cấp" labelPlacement="outside" placeholder="Nhập nơi cấp" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                )}
                                            />
                                            <Controller
                                                name="nationality"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Quốc tịch"
                                                        labelPlacement="outside"
                                                        variant="flat"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none", value: "text-sm" }}
                                                        selectedKeys={field.value ? [field.value] : []}
                                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="Việt Nam">Việt Nam</SelectItem>
                                                        <SelectItem key="Khác">Khác</SelectItem>
                                                    </Select>
                                                )}
                                            />
                                            <div className="col-span-2">
                                                <Controller
                                                    name="address"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} label="Địa chỉ" labelPlacement="outside" placeholder="Nhập địa chỉ" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Work Dept */}
                                    <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                                        <SectionHeader icon={IconLayoutGrid} title="Khoa/phòng làm việc" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Controller
                                                name="departmentIds"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Khoa quản lý"
                                                        labelPlacement="outside"
                                                        selectionMode="multiple"
                                                        variant="flat"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none", value: "text-sm" }}
                                                        isRequired
                                                        isInvalid={!!errors.departmentIds}
                                                        errorMessage={errors.departmentIds?.message}
                                                        selectedKeys={new Set(field.value)}
                                                        onSelectionChange={(keys) => field.onChange(Array.from(keys))}
                                                    >
                                                        {departmentOptions.map((opt) => (
                                                            <SelectItem key={opt.value}>{opt.label}</SelectItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                            <Controller
                                                name="roomIds"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Phòng quản lý"
                                                        labelPlacement="outside"
                                                        selectionMode="multiple"
                                                        variant="flat"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none", value: "text-sm" }}
                                                        isRequired
                                                        isInvalid={!!errors.roomIds}
                                                        errorMessage={errors.roomIds?.message}
                                                        selectedKeys={new Set(field.value)}
                                                        onSelectionChange={(keys) => field.onChange(Array.from(keys))}
                                                    >
                                                        {roomOptions.map((opt) => (
                                                            <SelectItem key={opt.value}>{opt.label}</SelectItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                            <Controller
                                                name="workType"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Loại hình"
                                                        placeholder="Chọn loại hình"
                                                        labelPlacement="outside"
                                                        variant="flat"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none", value: "text-sm" }}
                                                        selectedKeys={field.value ? [field.value] : []}
                                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="FULL_TIME">Toàn thời gian</SelectItem>
                                                        <SelectItem key="PART_TIME">Bán thời gian</SelectItem>
                                                    </Select>
                                                )}
                                            />
                                            <Controller
                                                name="jobTitle"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Chức danh"
                                                        placeholder="Chọn chức danh"
                                                        labelPlacement="outside"
                                                        variant="flat"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none", value: "text-sm" }}
                                                        isRequired
                                                        isInvalid={!!errors.jobTitle}
                                                        errorMessage={errors.jobTitle?.message}
                                                        selectedKeys={field.value ? [field.value] : []}
                                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="DOCTOR">Bác sĩ</SelectItem>
                                                        <SelectItem key="NURSE">Điều dưỡng</SelectItem>
                                                        <SelectItem key="TECHNICIAN">Kỹ thuật viên</SelectItem>
                                                        <SelectItem key="MIDWIFE">Hộ sinh</SelectItem>
                                                        <SelectItem key="PHYSICIAN_ASSISTANT">Y sĩ</SelectItem>
                                                        <SelectItem key="OFFICE_STAFF">Nhân viên văn phòng</SelectItem>
                                                    </Select>
                                                )}
                                            />
                                            <Controller
                                                name="position"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Cấp bậc"
                                                        placeholder="Chọn cấp bậc"
                                                        labelPlacement="outside"
                                                        variant="flat"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none", value: "text-sm" }}
                                                        isRequired
                                                        isInvalid={!!errors.position}
                                                        errorMessage={errors.position?.message}
                                                        selectedKeys={field.value ? [field.value] : []}
                                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="STAFF">Nhân viên</SelectItem>
                                                        <SelectItem key="HEAD_OF_DEPARTMENT">Trưởng khoa</SelectItem>
                                                        <SelectItem key="DEPUTY_HEAD_OF_DEPARTMENT">Phó khoa</SelectItem>
                                                        <SelectItem key="CHIEF_NURSE">Điều dưỡng trưởng</SelectItem>
                                                        <SelectItem key="MANAGER">Trưởng phòng</SelectItem>
                                                        <SelectItem key="HEAD_OF_UNIT">Trưởng bộ phận</SelectItem>
                                                        <SelectItem key="DEPUTY_MANAGER">Phó phòng</SelectItem>
                                                    </Select>
                                                )}
                                            />
                                            <Controller
                                                name="contractType"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Loại hình hợp đồng"
                                                        placeholder="Chọn loại hợp đồng"
                                                        labelPlacement="outside"
                                                        variant="flat"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none", value: "text-sm" }}
                                                        isRequired
                                                        isInvalid={!!errors.contractType}
                                                        errorMessage={errors.contractType?.message}
                                                        selectedKeys={field.value ? [field.value] : []}
                                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="FULL_TIME">Nhân viên chính thức</SelectItem>
                                                        <SelectItem key="PROBATION">Nhân viên thử việc</SelectItem>
                                                        <SelectItem key="INTERNSHIP">Nhân viên học việc</SelectItem>
                                                        <SelectItem key="EXPERT_COOPERATION">Chuyên gia hợp tác</SelectItem>
                                                    </Select>
                                                )}
                                            />
                                            <div className="col-span-2">
                                                <Controller
                                                    name="contractDuration"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} label="Thời hạn hợp đồng" labelPlacement="outside" placeholder="Nhập thời hạn" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Additional Info */}
                                    <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                                        <SectionHeader icon={IconFileDescription} title="Thông tin bổ sung" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Controller
                                                name="taxCode"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Mã số thuế" placeholder="Nhập mã số thuế" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                )}
                                            />
                                            <Controller
                                                name="insuranceNumber"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Số BHXH" placeholder="Nhập số BHXH" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                )}
                                            />
                                            <Controller
                                                name="accountNumber"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Số tài khoản" placeholder="Nhập số tài khoản" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                )}
                                            />
                                            <Controller
                                                name="beneficiaryName"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Tên người thụ hưởng" placeholder="Nhập tên người thụ hưởng" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                )}
                                            />
                                            <div className="col-span-2">
                                                <Controller
                                                    name="bankName"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} label="Tên ngân hàng" placeholder="Nhập tên ngân hàng" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-12 lg:col-span-5 space-y-6">
                                    {/* Section: Contact Info */}
                                    <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                                        <SectionHeader icon={IconPhone} title="Thông tin liên hệ" />
                                        <div className="space-y-4">
                                            <p className="text-xs font-semibold text-[#71717A] uppercase">Thông tin cá nhân</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                <Controller
                                                    name="phone"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} label="Số điện thoại" placeholder="Nhập số điện thoại" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} isRequired isInvalid={!!errors.phone} errorMessage={errors.phone?.message} />
                                                    )}
                                                />
                                                <Controller
                                                    name="email"
                                                    control={control}
                                                    render={({ field }) => (
                                                        <Input {...field} type="email" label="Email" placeholder="abc@domain.com" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} isRequired isInvalid={!!errors.email} errorMessage={errors.email?.message} />
                                                    )}
                                                />
                                            </div>

                                            <div className="pt-2">
                                                <p className="text-xs font-semibold text-[#71717A] uppercase mb-4">Thông tin liên hệ khẩn cấp</p>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Controller
                                                        name="emergencyContact"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input {...field} label="Tên người liên hệ" placeholder="Nhập tên người liên hệ" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                        )}
                                                    />
                                                    <Controller
                                                        name="emergencyContactPhone"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input {...field} label="Số điện thoại" placeholder="Nhập số điện thoại" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} isInvalid={!!errors.emergencyContactPhone} errorMessage={errors.emergencyContactPhone?.message} />
                                                        )}
                                                    />
                                                    <Controller
                                                        name="emergencyContactAddress"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input {...field} label="Địa chỉ" placeholder="Nhập địa chỉ" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                        )}
                                                    />
                                                    <Controller
                                                        name="emergencyContactRelationship"
                                                        control={control}
                                                        render={({ field }) => (
                                                            <Input {...field} label="Mối quan hệ" placeholder="Nhập mối quan hệ" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section: Qualifications */}
                                    <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                                        <SectionHeader icon={IconSchool} title="Bằng cấp chuyên môn" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Controller
                                                name="qualification"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Trình độ chuyên môn"
                                                        placeholder="Chọn trình độ"
                                                        labelPlacement="outside"
                                                        variant="flat"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none", value: "text-sm" }}
                                                        isRequired
                                                        isInvalid={!!errors.qualification}
                                                        errorMessage={errors.qualification?.message}
                                                        selectedKeys={field.value ? [field.value] : []}
                                                        onSelectionChange={(keys) => field.onChange(Array.from(keys)[0] as string)}
                                                    >
                                                        <SelectItem key="INTERMEDIATE">Trung cấp</SelectItem>
                                                        <SelectItem key="COLLEGE">Cao đẳng</SelectItem>
                                                        <SelectItem key="BACHELOR">Đại học</SelectItem>
                                                        <SelectItem key="MASTER">Thạc sĩ</SelectItem>
                                                        <SelectItem key="DOCTOR">Bác sĩ</SelectItem>
                                                        <SelectItem key="PHD">Tiến sĩ</SelectItem>
                                                        <SelectItem key="SPECIALIST_DOCTOR">Bác sĩ chuyên khoa</SelectItem>
                                                        <SelectItem key="OTHER">Khác</SelectItem>
                                                    </Select>
                                                )}
                                            />
                                            <Controller
                                                name="major"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Chuyên ngành" placeholder="Nhập chuyên ngành" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                )}
                                            />
                                            <Controller
                                                name="academicTitles"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select
                                                        label="Học hàm học vị"
                                                        placeholder="Chọn học hàm học vị"
                                                        labelPlacement="outside"
                                                        variant="flat"
                                                        selectionMode="multiple"
                                                        classNames={{ trigger: "bg-[#F4F4F5] rounded-xl shadow-none", value: "text-sm" }}
                                                        selectedKeys={new Set(field.value)}
                                                        onSelectionChange={(keys) => field.onChange(Array.from(keys))}
                                                    >
                                                        <SelectItem key="Bác sĩ">Bác sĩ</SelectItem>
                                                        <SelectItem key="Thạc sĩ">Thạc sĩ</SelectItem>
                                                        <SelectItem key="Tiến sĩ">Tiến sĩ</SelectItem>
                                                        <SelectItem key="Bác sĩ chuyên khoa I">Bác sĩ chuyên khoa I</SelectItem>
                                                        <SelectItem key="Bác sĩ chuyên khoa II">Bác sĩ chuyên khoa II</SelectItem>
                                                        <SelectItem key="Bác sĩ nội trú">Bác sĩ nội trú</SelectItem>
                                                        <SelectItem key="Giáo sư">Giáo sư</SelectItem>
                                                        <SelectItem key="Phó giáo sư">Phó giáo sư</SelectItem>
                                                        <SelectItem key="TTND">TTND</SelectItem>
                                                        <SelectItem key="TTUT">TTUT</SelectItem>
                                                    </Select>
                                                )}
                                            />
                                            <Controller
                                                name="certificateNumber"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Số CCHN" placeholder="Nhập số CCHN" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                )}
                                            />
                                            <Controller
                                                name="certificateIssuePlace"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} label="Nơi cấp" placeholder="Nhập nơi cấp" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} />
                                                )}
                                            />
                                            <Controller
                                                name="certificateExpiryDate"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input {...field} type="date" label="Ngày hết hạn" labelPlacement="outside" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-xl shadow-none", input: "text-sm" }} isInvalid={!!errors.certificateExpiryDate} errorMessage={errors.certificateExpiryDate?.message} />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    {/* Section: Notes */}
                                    <div className="bg-white p-5 rounded-2xl border border-[#E4E4E7] shadow-sm">
                                        <SectionHeader icon={IconMessage2} title="Ghi chú" />
                                        <Controller
                                            name="note"
                                            control={control}
                                            render={({ field }) => (
                                                <Textarea {...field} placeholder="Nhập ghi chú" variant="flat" classNames={{ inputWrapper: "bg-[#F4F4F5] rounded-2xl shadow-none", input: "text-sm" }} />
                                            )}
                                        />
                                    </div>
                                </div>
                            </form>
                        </DrawerBody>
                        <DrawerFooter>
                            <Button variant="flat" onPress={handleClose} className="font-medium rounded-xl">
                                Hủy bỏ
                            </Button>
                            <Button color="primary" type="submit" form="staff-form" isLoading={isPending || isUpdating} className="font-medium rounded-xl">
                                Lưu thông tin
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
};
