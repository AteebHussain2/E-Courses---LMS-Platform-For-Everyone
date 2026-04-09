"use client"

import { SessionAddButton } from "@/components/custom/buttons/SessionAddButton";
import { useSessionFilters } from "@/hooks/use-session-filters";
import { useSessions } from "@/hooks/use-sessions";
import SessionFilters from "./SessionFilters";
import SessionsGrid from "./SessionsGrid";
import Pagination from "../Pagination";

const SessionsPage = ({ communitySlug }: { communitySlug: string }) => {
    const { filters, setPage } = useSessionFilters()
    const { data, isLoading } = useSessions(communitySlug, filters)

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <SessionFilters communitySlug={communitySlug} />
                <SessionAddButton className="w-32 rounded-sm!" />
            </div>

            <SessionsGrid isLoading={isLoading} sessions={data?.sessions} communitySlug={communitySlug} />

            <Pagination
                total={data?.total ?? 0}
                currentPage={filters.page}
                onPageChange={setPage}
            />
        </div>
    )
}

export default SessionsPage
