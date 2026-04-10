import { NAMESPACES } from "@/i18n/constants"
import { icons } from "@/lib/icons"
import { Button, type ButtonProps } from "@heroui/react"
import { useTranslation } from "react-i18next"

export const BtnCreate = ({ children, ...props }: ButtonProps) => {
    const { t } = useTranslation(NAMESPACES.COMMON)
    return <Button color="primary" className="h-10 px-4" {...props}>
        {icons.plus}
        {children ?? t('button.addNew')}
    </Button>
}
export const BtnBack = ({ ...props }: ButtonProps) => {
    return <Button color="primary" className="h-10 px-4" {...props}>
        {icons.arrowLeft}
    </Button>
}