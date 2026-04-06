import { DrawerType, useDrawer } from "@/store/useDrawer"
import { Button } from "@heroui/react"
import { useParams } from "@tanstack/react-router"
import { HR } from "./hr"
import { useTranslation } from "react-i18next"
import { NAMESPACES } from "@/i18n/constants"
import { useControlMode } from "../../salary-and-benefits/hooks/use-control-mode-handle"

export const Header = () => {
    const { id } = useParams({ strict: false })
    const { t } = useTranslation(NAMESPACES.STAFF_MANAGEMENT)
    const { onOpen } = useDrawer()
    const { isReadOnly } = useControlMode()
    return (
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-medium">{t('staffDetail.tabs.documents')}</h1>
            <div className="flex gap-3.75">
                {/* <Button isIconOnly>
                    <icons.documentDownload />
                </Button>
                <Button isIconOnly>
                    <icons.documentUpload />
                </Button> */}
                <HR />
                {!isReadOnly && (
                    <Button color="primary" onPress={() => onOpen(DrawerType.PROFILE_STAFF_DETAIL, { staffId: id })}>
                        {t("document.add_new")}
                    </Button>
                )}
            </div>
        </div>

    )
}