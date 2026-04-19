"use server"

import { ModuleWithLessons } from "@/lib/types";
import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export async function getModulesAction(communitySlug: string, courseId?: string, courseSlug?: string) {
    const params = new URLSearchParams({ communitySlug })

    if (courseId) {
        params.set('courseId', courseId)
    } else if (courseSlug) {
        params.set('courseSlug', courseSlug)
    }

    const identifier = courseId ?? courseSlug!

    const res = await fetch(getUrl(`/api/modules?${params}`), {
        headers: apiHeaders,
        next: {
            revalidate: 300,
            tags: ['modules', `modules:${identifier}`]
        }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch modules")

    return data.modules as ModuleWithLessons[]
}

export async function createModuleAction(title: string, courseId: string, communitySlug: string) {
    const res = await fetch(getUrl('/api/modules'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ title, courseId, communitySlug })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to create module")

    return data.module
}

export async function updateModuleAction(moduleId: string, title: string, communitySlug: string) {
    const res = await fetch(getUrl(`/api/modules/${moduleId}`), {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({ title, communitySlug })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to update module")

    return data.module
}

export async function reorderModulesAction(
    courseId: string,
    communitySlug: string,
    order: { id: string, index: number }[]
) {
    const res = await fetch(getUrl('/api/modules/reorder'), {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({ courseId, communitySlug, order })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to reorder modules")

    return data
}

export async function deleteModuleAction(moduleId: string) {
    const res = await fetch(getUrl(`/api/modules/${moduleId}`), {
        method: 'DELETE',
        headers: apiHeaders
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to delete module")

    return data
}