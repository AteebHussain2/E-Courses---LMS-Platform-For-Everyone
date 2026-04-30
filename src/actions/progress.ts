"use server"

import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export type ProgressMap = Record<string, {
    percent: number
    isComplete: boolean
    completedAt: string | null
}>

export async function getCourseProgressAction(
    userId: string,
    courseId: string
): Promise<ProgressMap> {
    const res = await fetch(
        getUrl(`/api/progress?userId=${userId}&courseId=${courseId}`),
        { headers: apiHeaders, next: { revalidate: 30 } }
    )
    const data = await res.json()
    if (!res.ok) return {}
    return data.progress as ProgressMap
}

export async function updateWatchProgressAction(
    userId: string,
    lessonId: string,
    videoId: string,
    percent: number
): Promise<void> {
    await fetch(getUrl('/api/progress'), {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({ userId, lessonId, videoId, percent })
    })
}

export async function toggleLessonCompleteAction(
    userId: string,
    lessonId: string
): Promise<{ isComplete: boolean }> {
    const res = await fetch(getUrl('/api/progress/complete'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ userId, lessonId })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to toggle")
    return { isComplete: data.isComplete }
}