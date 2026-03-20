import type { ShiftManagementParams } from "@/types";
import { useStaffProfileList } from "../salary-and-benefits/hooks/use-staff-profile";
import FileCard from "./components/file-card";
import { Header } from "./components/header"
import { PageFilter } from "./components/page-filter"
import { useQueryFilter } from "@/hooks/useQueryFilter";
import { useParams } from "@tanstack/react-router";

import type { IStaffDocument } from "@/types/staff-profile.type";

export const StaffProfile = () => {
    const { id: staffId } = useParams({ strict: false })
    const { filters } = useQueryFilter<ShiftManagementParams>();
    const { data, isLoading } = useStaffProfileList({
        page: filters.page ?? 1,
        limit: filters.limit ?? 10,
        search: filters.search,
        sortBy: filters?.sortBy,
        id: staffId!
    });
    return (
        <div className="flex flex-col gap-3.75">
            <Header />
            <PageFilter />
            <div className="grid grid-cols-[repeat(auto-fill,minmax(246px,1fr))] gap-6">
                {data?.data?.data.map((profile: IStaffDocument) => (
                    <FileCard
                        key={profile.id}
                        {...profile}
                        thumbnail={profile.thumbnail || ""}
                        uploadedBy={profile.uploadedBy || profile.createdByName}
                        onMore={() => console.log("More", profile.id)}
                    />
                ))}
            </div>
        </div>
    )
}
