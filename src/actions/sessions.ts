"use server";

import { SortFilter, StatusFilter, TimeFilter } from "@/hooks/use-session-filters";
import { Session } from "@/generated/prisma/client";
import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export type SessionFilters = {
    status: StatusFilter
    time: TimeFilter
    sort: SortFilter
}

export async function getSessionsAction(communitySlug: string, filters: SessionFilters, offset: number = 0) {
    const params = new URLSearchParams({
        communitySlug,
        offset: String(offset),
        ...filters
    })

    const res = await fetch(getUrl(`/api/sessions?${params}`), {
        headers: apiHeaders
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch sessions")

    return data as {
        sessions: Session[]
        total: number
        hasMore: boolean
    }
}

export async function deleteSessionAction(sessionId: string, communitySlug: string) {
    const res = await fetch(getUrl(`/api/sessions/${sessionId}`), {
        method: 'DELETE',
        headers: apiHeaders,
        body: JSON.stringify({ communitySlug })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to delete session")

    return data
}