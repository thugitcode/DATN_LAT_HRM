import { icons } from "@/lib/icons"
import { Button } from "@heroui/react"
import { HR } from "./hr"
import { DrawerType, useDrawer } from "@/store/useDrawer"
import { useParams } from "@tanstack/react-router"

export const Header = () => {
    const { id } = useParams({ strict: false })

    const { onOpen } = useDrawer()
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium">Hồ sơ nhân viên</h1>
            <div className="flex gap-3.75">
                {/* <Button isIconOnly>
                    <icons.documentDownload />
                </Button>
                <Button isIconOnly>
                    <icons.documentUpload />
                </Button> */}
                <HR />
                <Button color="primary" onPress={() => onOpen(DrawerType.PROFILE_STAFF_DETAIL, { staffId: id })}>
                    Thêm mới tài liệu
                </Button>
            </div>
        </div>

    )
}