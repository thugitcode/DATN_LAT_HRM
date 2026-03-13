export const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4">
        {Icon}
        <h3 className="font-semibold text-sm text-[#11181C] uppercase tracking-wider">{title}</h3>
    </div>
);