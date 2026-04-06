"use server"

import { apiHeaders } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getUrl } from "@/lib/utils";

// TODO: CHANGE THIS LOGIC FROM HERE TO API ROUTE

export async function getLessonAction(lessonId: string) {
    const lesson = await prisma.lesson.findFirst({
        where: { id: lessonId, deletedAt: null },
        include: {
            video: true,
            session: true,
            module: {
                select: {
                    courseId: true,
                    title: true,
                }
            }
        }
    })
    return lesson
}

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

// For creating/upadting a video always pointing to a lesson of some course

type VideoPayload = {
    description?: string
    imageUrl?: string
    videoUrl?: string
    duration?: number
}

export async function saveVideoAction(lessonId: string, payload: VideoPayload) {
    const res = await fetch(getUrl(`/api/lessons/${lessonId}/video`), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to save video")

    return data.video
}

// For creating/updating a session linked with course ---> lesson

type SessionPayload = {
    title: string
    description?: string
    scheduledAt: Date | string
    duration?: number
    platformLink?: string
    imageUrl?: string
    status?: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED'
}

export async function saveSessionAction(lessonId: string, payload: SessionPayload) {
    const res = await fetch(getUrl(`/api/lessons/${lessonId}/session`), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to save session")

    return data.session
}