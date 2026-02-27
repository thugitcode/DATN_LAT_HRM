import { FormArea } from "@/components/form-fields/form-area";
import { ShiftDetailsCard } from "@/features/timekeeping-shift-scheduling/timekeeping-management/components/detailed-time-sheet/shift-details-card";
import { useDrawer } from "@/store/useDrawer";
import { AttendanceExplanationType } from "@/types/attendance-explanation.type";
import { Accordion, AccordionItem, Button, Form, Image, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconCaretRightFilled } from "@tabler/icons-react";
import { useForm } from "react-hook-form";
import { shiftDetailsSchema, type shiftDetailsFormValues } from "../../schemas/shift-details.schema";
const normalShift = {
    staffName: "Nguyễn Văn An",
    staffCode: "NV001",
    roomName: "Phòng IT - Tầng 3",
    departmentName: "Công nghệ thông tin",
    staffAvatar: "https://i.pravatar.cc/150?u=an.nguyen",
    shiftName: "Ca ngày (08:00 - 17:00)",
    dateLabel: "Thứ Tư, 25/02/2026",
    typeLabel: AttendanceExplanationType.MISSING_HOURS,
    actualCheckIn: "08:02",
    actualCheckOut: "17:05",
    totalActualWorkingHours: 8.05,
    reason: null,
    attachments: [],
    managerConfirmation: true,
    managerName: "Trần Thị Bình",
    hrComment: "Đúng giờ, hiệu suất tốt",
    status: "approved",
    breakMinutes: 60,
    convertCompHours: true, // có quy đổi giờ bù không
    compHourRate: 1.5,// tỷ lệ quy đổi (vd: 1h OT = 1.5h bù)
    location: "Central Park, Quận 1, thành phố Hồ Chí Minh"
};

export const mockAdjustmentRequests = [
    {
        id: "ADJ-001",
        employeeName: "Nguyễn Thu Lan",
        employeeCode: "NV027",
        employeeAvatar: "https://i.pravatar.cc/150?u=lan.nguyen",
        department: "Nhân sự",
        room: "Tầng 1 - HR",
        originalCheckIn: "08:00",
        adjustedCheckIn: "08:30",
        adjustmentType: "check_in",
        reason: "Lỗi chấm công",
        requestedAt: "2026-02-26T09:15:00",
        requestedBy: "Nguyễn Thu Lan",
        status: "pending",           // pending | approved | rejected
        managerComment: null,
        hrComment: null,
    },
    {
        id: "ADJ-002",
        employeeName: "Nguyễn Thu Lan",
        employeeCode: "NV027",
        employeeAvatar: "https://i.pravatar.cc/150?u=lan.nguyen",
        department: "Nhân sự",
        room: "Tầng 1 - HR",
        originalCheckIn: "08:00",
        adjustedCheckIn: "08:30",
        adjustmentType: "check_in",
        reason: "Lỗi chấm công",
        requestedAt: "2026-02-25T14:40:00",
        requestedBy: "Nguyễn Thu Lan",
        status: "approved",
        managerComment: "Đã kiểm tra camera, xác nhận lỗi máy chấm công",
        hrComment: "Cập nhật lại công ngày 25/02/2026",
    },
    {
        id: "ADJ-003",
        employeeName: "Nguyễn Thu Lan",
        employeeCode: "NV027",
        employeeAvatar: "https://i.pravatar.cc/150?u=lan.nguyen",
        department: "Nhân sự",
        room: "Tầng 1 - HR",
        originalCheckIn: "08:00",
        adjustedCheckIn: "08:30",
        adjustmentType: "check_in",
        reason: "Lỗi chấm công",
        requestedAt: "2026-02-24T10:22:00",
        requestedBy: "Nguyễn Thu Lan",
        status: "pending",
        managerComment: null,
        hrComment: null,
    },
    {
        id: "ADJ-004",
        employeeName: "Nguyễn Thu Lan",
        employeeCode: "NV027",
        employeeAvatar: "https://i.pravatar.cc/150?u=lan.nguyen",
        department: "Nhân sự",
        room: "Tầng 1 - HR",
        originalCheckIn: "08:00",
        adjustedCheckIn: "08:30",
        adjustmentType: "check_in",
        reason: "Lỗi chấm công",
        requestedAt: "2026-02-23T16:05:00",
        requestedBy: "Nguyễn Thu Lan",
        status: "rejected",
        managerComment: "Không có bằng chứng lỗi hệ thống",
        hrComment: "Yêu cầu bổ sung ảnh chụp màn hình hoặc biên bản",
    },
];

const columns = [
    { key: "employeeName", label: "NGƯỜI ĐIỀU CHỈNH" },
    { key: "adjustedTime", label: "GIỜ ĐIỀU CHỈNH" },
    { key: "reason", label: "LÝ DO ĐIỀU CHỈNH" },
];

export const ShiftDetailsDrawer = () => {
    const closedDrawer = useDrawer((state) => state.onClose);
    const {
        control,
        handleSubmit,
        formState: { isSubmitting, errors },
        getValues
    } = useForm<shiftDetailsFormValues>({
        resolver: zodResolver(shiftDetailsSchema),
        defaultValues: {
            reason: "",
            actualCheckIn: normalShift.actualCheckIn,
            actualCheckOut: normalShift.actualCheckOut,
            // faceIdCheckIn: undefined,
            // faceIdCheckOut: undefined,
        },
        mode: 'onChange',
    });

    const onSubmit = async (values: any) => {
        console.log('values', values);
    };    
    return (

        <Form
            className="h-full gap-2 flex flex-col"
            validationBehavior="aria"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="bg-white w-full p-4 gap-3 flex flex-col">
                <ShiftDetailsCard shift={normalShift} control=
                    {control} />
                <div className="flex gap-3">
                    <div className="flex flex-col gap-3">
                        <div className="font-medium">FaceID check in</div>
                        <Image
                            alt="HeroUI hero Image"
                            src="https://heroui.com/images/hero-card-complete.jpeg"
                            width={183}
                            height={183}
                            isZoomed
                            object-cover
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="font-medium">FaceID check out</div>
                        <Image
                            alt="HeroUI hero Image"
                            src="https://heroui.com/images/hero-card-complete.jpeg"
                            width={183}
                            height={183}
                            isZoomed
                            object-cover
                        />
                    </div>
                </div>
            </div>
            <div className="p-4 w-full">
                <div className="bg-white rounded-xl p-3 size-full space-y-3 overflow-auto ">
                    <FormArea
                        control={control}
                        name={'reason'}
                        label="Lý do điều chỉnh"
                        // isRequired
                        disabled={isSubmitting}
                        maxRows={16}
                        classNames={{ label: "text-base font-normal leading-4 text-[#52525B] mb-3" }}
                    />
                </div>
            </div>
            <div className="px-4 py-0 w-full">
                <Accordion selectionMode="multiple" className="px-0 w-full">
                    <AccordionItem classNames={{ title: "text-2xl font-medium leading-[32px]", trigger: "flex-row-reverse pt-0 gap-3", indicator: "data-[open=true]:!rotate-90 text-black" }} key="1" aria-label="Lịch sử điều chỉnh" title="Lịch sử điều chỉnh" indicator={<IconCaretRightFilled />}>
                        <Table aria-label="Example static collection table">
                            <TableHeader columns={columns}>
                                {(column) => (
                                    <TableColumn
                                        key={column.key}
                                    >
                                        {column.label}
                                    </TableColumn>
                                )}
                            </TableHeader>
                            <TableBody items={mockAdjustmentRequests}>
                                {(item) => (
                                    <TableRow key={item.id}>
                                        <TableCell>{item.employeeName}</TableCell>
                                        <TableCell>
                                            {item.originalCheckIn} → {item.adjustedCheckIn}
                                        </TableCell>
                                        <TableCell>{item.reason}</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </AccordionItem>
                </Accordion>
            </div>
            <div className="flex justify-end gap-2 pt-3 pb-6 px-6 bg-white w-full">
                <Button
                    variant="light"
                    onPress={closedDrawer}
                    className="border-[#006FEE] border bg-white text-[#006FEE] text-[14px] font-normal"
                >
                    Hủy
                </Button>
                <Button type="submit" color="primary" isLoading={isSubmitting}>
                    Cập nhật
                </Button>
            </div>
        </Form>
    )
}