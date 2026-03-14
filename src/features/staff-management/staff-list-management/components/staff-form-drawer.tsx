import { useDepartmentOptions } from "@/hooks/select-options/use-department-options";
import { useRoomOptions } from "@/hooks/select-options/use-room-options";
import {
    Avatar,
    Button,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerFooter,
    DrawerHeader
} from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    IconCamera, IconUser
} from "@tabler/icons-react";
import { Form, FormProvider, useForm } from "react-hook-form";
import type { FieldValues, Resolver } from "react-hook-form";
// Enum imports removed as they are now used via strings or not at all in this component's logic
import { FormArea } from "@/components/form-fields/form-area";
import { FormDatePicker } from "@/components/form-fields/form-date-picker";
import { FormInput } from "@/components/form-fields/form-input";
import { FormSelect } from "@/components/form-fields/form-select";
import { NAMESPACES } from "@/i18n/constants";
import { icons } from "@/lib/icons";
import { useCreateStaff, useUpdateStaff } from "@/query-options/staff";
import type { Staff } from "@/types/staff.type";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { staffSchema, type StaffFormValues } from "../schemas/staff.schema";
import { SectionHeader } from "../../staff-detail/components/staff-detail-sections/section-header";
import { AvatarSection } from "../../staff-detail/components/staff-detail-sections/avatar-section";
import { PersonnelInfoSection } from "../../staff-detail/components/staff-detail-sections/personnel-info-section";
import { DepartmentSection } from "../../staff-detail/components/staff-detail-sections/department-section";
import { AdditionalInfoSection } from "../../staff-detail/components/staff-detail-sections/additional-info-section";
import { ContactSection } from "../../staff-detail/components/staff-detail-sections/contact-section";
import { QualificationSection } from "../../staff-detail/components/staff-detail-sections/qualification-section";
import { BtnCancel } from "@/components/btn-cancel";

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
    departmentIds: "",
    roomIds: "",
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




interface StaffFormDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    editData?: Staff;
}

export const StaffFormDrawer = ({ isOpen, onClose, editData }: StaffFormDrawerProps) => {
    const { mutateAsync: createStaff, isPending } = useCreateStaff();
    const { mutateAsync: updateStaff, isPending: isUpdating } = useUpdateStaff();
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT);
    const { t: tc } = useTranslation(NAMESPACES.COMMON);
    const form = useForm<StaffFormValues>({
        resolver: zodResolver(staffSchema(t)) as Resolver<StaffFormValues, FieldValues>,
        defaultValues: FORM_DEFAULT_VALUES,
        mode: "onChange"
    });
    const { handleSubmit, reset } = form

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
                        || "",
                    roomIds: editData.rlsStaffRooms?.map(rr => rr.room.id)
                        || editData.rooms?.map(r => r.id)
                        || "",
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
    const onFormSubmit = handleSubmit(
        (data) => {
            console.log("Dữ liệu hợp lệ:", data);
            onSubmit(data);
        },
        (errors) => {
            console.log("Lỗi validation:", errors);
        }
    );
    const onSubmit = async (data: StaffFormValues) => {
        const cleanedData = Object.fromEntries(
            Object.entries(data).map(([key, value]) => [
                key,
                value === "" ? undefined : value
            ])
        );

        try {
            if (editData?.id) {
                await updateStaff({ id: editData.id, data: { ...cleanedData, departmentIds: [cleanedData.departmentIds], roomIds: [cleanedData.roomIds] } as any });
            } else {
                await createStaff({ ...cleanedData, departmentIds: [cleanedData.departmentIds], roomIds: [cleanedData.roomIds] } as any);
            }
            onClose();
        } catch (error) {
            console.error("Staff Form Error:", error);
        }
    };

    const onInvalid = (errors: any) => {
        console.error("Staff Form Validation Errors:", errors);
    };

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
            isDismissable={false}
        >
            <DrawerContent>
                {(handleClose) => (
                    <>
                        <DrawerHeader className="flex flex-col gap-1">
                            <h2 className="text-xl font-bold">{editData ? "Cập nhật thông tin nhân viên" : "Thêm mới nhân viên"}</h2>
                        </DrawerHeader>
                        <DrawerBody className="overflow-y-auto cursor-default">
                            <FormProvider {...form}>
                                <Form
                                    id="staff-form"
                                    onSubmit={onFormSubmit}
                                    className="p-6 grid grid-cols-12 gap-3.75"
                                >
                                    <AvatarSection />

                                    {/* CỘT TRÁI (7 CỘT) */}
                                    <div className="col-span-12 lg:col-span-7 space-y-6">
                                        <PersonnelInfoSection />
                                        <DepartmentSection />
                                        <AdditionalInfoSection />
                                    </div>

                                    {/* CỘT PHẢI (5 CỘT) */}
                                    <div className="col-span-12 lg:col-span-5 space-y-6">
                                        <ContactSection />
                                        <QualificationSection />
                                    </div>
                                </Form>

                            </FormProvider>
                        </DrawerBody>
                        <DrawerFooter>
                            <BtnCancel onPress={handleClose} />
                            <Button color="primary" type="submit" form="staff-form" isLoading={isPending || isUpdating} className="font-medium rounded-xl">
                                {tc("button.save")}
                            </Button>
                        </DrawerFooter>
                    </>
                )}
            </DrawerContent>
        </Drawer>
    );
};
