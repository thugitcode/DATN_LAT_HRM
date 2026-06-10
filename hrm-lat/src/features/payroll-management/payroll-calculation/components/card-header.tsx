import { formatCurrency } from "@/lib/utils"

export const CardHeader = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: number }) => {
    return <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium text-lg leading-7">{title}</span>
        </div>
        <span className="font-medium text-lg leading-7">
            {formatCurrency(value)}
        </span>
    </div>
}