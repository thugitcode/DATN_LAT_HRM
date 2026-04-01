import type { ShiftManagementParams } from "@/types";
import { useStaffProfileList } from "../salary-and-benefits/hooks/use-staff-profile";
import FileCard from "./components/file-card";
import { Header } from "./components/header"
import { PageFilter } from "./components/page-filter"
import { useQueryFilter } from "@/hooks/useQueryFilter";
import { useParams } from "@tanstack/react-router";

import type { IStaffDocument } from "@/types/staff-profile.type";
import { Card } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { NAMESPACES } from "@/i18n/constants";

export const StaffProfile = () => {
    const { id: staffId } = useParams({ strict: false })
    const { t } = useTranslation(NAMESPACES.COMMON);
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
            {data?.data?.data?.length ? <div className="grid grid-cols-[repeat(auto-fill,minmax(246px,1fr))] gap-6">
                {data?.data?.data.map((profile: IStaffDocument) => (
                    <FileCard
                        key={profile.id}
                        {...profile}
                        thumbnail={profile.thumbnail || ""}
                        uploadedBy={profile.uploadedBy || profile.createdByName}
                        onMore={() => { }}
                    />
                ))}
            </div> : (
                <Card className="flex h-30 items-center justify-center p-6 text-default-400 shadow-none border border-default-200 bg-default-50/50">
                    <p className="text-sm">{t("table.empty")}</p>
                </Card>
            )}
        </div>
    )
}
