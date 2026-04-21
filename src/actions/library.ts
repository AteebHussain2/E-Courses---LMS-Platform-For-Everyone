"use server"

import { SavedCourseItem, SavedSessionItem } from "@/lib/types";
import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export type SavedData = {
    courses: SavedCourseItem[]
    sessions: SavedSessionItem[]
}

export async function toggleSaveAction(
    userId: string,
    courseId: string,
    communitySlug: string
): Promise<{ saved: boolean }> {
    const res = await fetch(getUrl('/api/library'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ userId, courseId, communitySlug })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to update library")

    return { saved: data.saved }
}

export async function checkCourseSavedAction(
    userId: string,
    courseId: string,
    communitySlug: string
): Promise<boolean> {
    const res = await fetch(
        getUrl(`/api/library?userId=${userId}&courseId=${courseId}&communitySlug=${communitySlug}`),
        { headers: apiHeaders, next: { revalidate: 60 } }
    )
    const data = await res.json()
    if (!res.ok) return false

    return data.saved as boolean
}

export async function checkSessionSavedAction(
    userId: string,
    sessionId: string,
    communitySlug: string
): Promise<boolean> {
    const res = await fetch(
        getUrl(`/api/library?userId=${userId}&sessionId=${sessionId}&communitySlug=${communitySlug}`),
        { headers: apiHeaders, next: { revalidate: 60 } }
    )
    const data = await res.json()
    if (!res.ok) return false
    return data.saved as boolean
}

export async function getSavedDataAction(
    userId: string,
    communitySlug: string
): Promise<SavedData> {
    const res = await fetch(
        getUrl(`/api/library?userId=${userId}&communitySlug=${communitySlug}`),
        {
            headers: apiHeaders,
            next: { revalidate: 120, tags: [`library:${userId}`] }
        }
    )
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch library")

    return data as SavedData
}