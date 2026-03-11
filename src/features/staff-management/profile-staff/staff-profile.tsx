import type { ShiftManagementParams } from "@/types";
import { useStaffProfileList } from "../salary-and-benefits/hooks/use-staff-profile";
import FileCard from "./components/file-card";
import { Header } from "./components/header"
import { PageFilter } from "./components/page-filter"
import { useQueryFilter } from "@/hooks/useQueryFilter";

export const StaffProfile = () => {
    const { filters } = useQueryFilter<ShiftManagementParams>();
    const { data, isLoading } = useStaffProfileList({
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        search: filters.search,
        sortBy: filters?.sortBy
    });
    
    return (
        <div className="flex flex-col gap-3.75">
            <Header />
            <PageFilter />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(246px,1fr))] gap-6">
                {data?.data.map((profile) => (
                    <FileCard
                        key={profile.id}
                        {...profile}
                        onDownload={() => console.log("Download", profile.id)}
                        onMore={() => console.log("More", profile.id)}
                    />
                ))}
            </div>
        </div>
    )
}
