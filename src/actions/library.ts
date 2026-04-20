"use server"

import { CourseWithInstructorAndCount } from "@/lib/types";
import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export type SavedCourseItem = CourseWithInstructorAndCount & {
    savedAt: string
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

export async function checkSavedAction(
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

export async function getSavedCoursesAction(
    userId: string,
    communitySlug: string
): Promise<SavedCourseItem[]> {
    const res = await fetch(
        getUrl(`/api/library?userId=${userId}&communitySlug=${communitySlug}`),
        {
            headers: apiHeaders,
            next: { revalidate: 120, tags: [`library:${userId}`] }
        }
    )
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch library")
    return data.courses as SavedCourseItem[]
}