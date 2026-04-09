"use server";

import { SortFilter, StatusFilter, TimeFilter } from "@/hooks/use-session-filters";
import { apiHeaders } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getUrl } from "@/lib/utils";

export type SessionFilters = {
    status: StatusFilter
    time: TimeFilter
    sort: SortFilter
}

export type SessionWithDetails = {
    id: string
    title: string
    description: string | null
    scheduledAt: Date
    duration: number | null
    platformLink: string | null
    imageUrl: string | null
    status: string
    createdAt: Date
    updatedAt: Date
    community: { id: string; slug: string }
    recording: { id: string } | null
    lesson: {
        id: string
        title: string
        module: {
            id: string
            title: string
            course: { id: string; title: string; slug: string }
        }
    } | null
}

export async function getSessionsAction(communitySlug: string, filters: SessionFilters, offset: number = 0) {
    const params = new URLSearchParams({
        communitySlug,
        offset: String(offset),
        ...filters
    })

    const res = await fetch(getUrl(`/api/sessions?${params}`), {
        headers: apiHeaders,
        next: { revalidate: 300, tags: ['sessions', `sessions:${communitySlug}`] }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch sessions")

    return data as { sessions: SessionWithDetails[]; total: number; hasMore: boolean }
}

export async function getSessionAction(sessionId: string, communitySlug: string) {
    const res = await fetch(getUrl(`/api/sessions/${sessionId}?communitySlug=${communitySlug}`), {
        headers: apiHeaders,
        next: { revalidate: 300, tags: ['sessions', `sessions:${communitySlug}`] }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch session")

    return data.session as SessionWithDetails
}

export async function createSessionAction(payload: {
    title: string
    description?: string
    scheduledAt: Date | string
    duration?: number
    platformLink?: string
    imageUrl?: string
    status?: string
    communitySlug: string
    lessonId?: string
}) {
    const res = await fetch(getUrl('/api/sessions'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to create session")

    return data.session
}

export async function updateSessionAction(sessionId: string, payload: {
    title: string
    description?: string
    scheduledAt: Date | string
    duration?: number
    platformLink?: string
    imageUrl?: string
    status?: string
    communitySlug: string
    lessonId?: string
    unlinkLesson?: boolean
}) {
    const res = await fetch(getUrl(`/api/sessions/${sessionId}`), {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to update session")

    return data.session
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

// Get SESSION-type lessons for a course that are unlinked or linked to a specific session
// TODO: Change the following to routes later
export async function getSessionLessonsForCourse(courseId: string, currentSessionId?: string) {
    const lessons = await prisma.lesson.findMany({
        where: {
            module: { courseId, deletedAt: null },
            type: 'SESSION',
            deletedAt: null,
            OR: [
                { sessionId: null },
                ...(currentSessionId ? [{ sessionId: currentSessionId }] : [])
            ]
        },
        select: {
            id: true,
            title: true,
            slug: true,
            sessionId: true,
            module: { select: { title: true } }
        },
        orderBy: { index: 'asc' }
    })
    return lessons
}

// Lightweight course list for the link-to-lesson selector
export async function getCoursesForCommunity(communitySlug: string) {
    const courses = await prisma.course.findMany({
        where: { community: { slug: communitySlug }, deletedAt: null },
        select: { id: true, title: true, slug: true },
        orderBy: { createdAt: 'desc' }
    })
    return courses
}