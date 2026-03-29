"use server"

import { apiHeaders } from "@/lib/api"
import { getUrl } from "@/lib/utils"

export async function createLessonAction(
    title: string,
    type: 'VIDEO' | 'SESSION',
    moduleId: string,
    courseId: string,
    communitySlug: string
) {
    const res = await fetch(getUrl('/api/lessons'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ title, type, moduleId, courseId, communitySlug })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to create lesson")

    return data.lesson
}

export async function reorderLessonsAction(
    moduleId: string,
    courseId: string,
    communitySlug: string,
    order: { id: string, index: number }[]
) {
    const res = await fetch(getUrl('/api/lessons/reorder'), {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({ moduleId, courseId, communitySlug, order })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to reorder lessons")

    return data
}

export async function deleteLessonAction(lessonId: string) {
    const res = await fetch(getUrl(`/api/lessons/${lessonId}`), {
        method: 'DELETE',
        headers: apiHeaders
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to delete lesson")

    return data
}