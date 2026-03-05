import { icons } from "@/lib/icons"
import { Button } from "@heroui/react"
import { HR } from "./hr"
import { DrawerType, useDrawer } from "@/store/useDrawer"

export const Header = () => {
    const { onOpen } = useDrawer()
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium">Hồ sơ nhân viên</h1>
            <div className="flex gap-3.75">
                <Button isIconOnly>
                    <icons.documentDownload />
                </Button>
                <Button isIconOnly>
                    <icons.documentUpload />
                </Button>
                <HR />
                <Button color="primary" onClick={() => onOpen(DrawerType.PROFILE_STAFF_DETAIL)}>
                    Thêm mới tài liệu
                </Button>
            </div>
        </div>

    )
}