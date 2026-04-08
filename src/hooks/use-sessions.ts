import { getSessionsAction, SessionFilters } from "@/actions/sessions";
import { useQuery } from "@tanstack/react-query";

export function useSessions(communitySlug: string, filters: SessionFilters) {
    return useQuery({
        queryFn: () => getSessionsAction(communitySlug, filters),
        queryKey: ['courses', communitySlug, filters],   // refetches when filter changes
        refetchOnReconnect: false,
        staleTime: 1000 * 3600 * 1,
    })
}