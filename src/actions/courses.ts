"use server"

import { courseSchemaType } from "@/lib/schemas/course";
import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export async function createCourseAction(values: courseSchemaType, communitySlug: string) {
    const res = await fetch(getUrl('/api/courses/add'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ ...values, communitySlug })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Something went wrong")

    return data
}

export async function updateCourseAction(values: courseSchemaType, courseId: string, communitySlug: string) {
    const res = await fetch(getUrl(`/api/courses/${courseId}`), {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({ ...values, communitySlug })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Something went wrong")

    return data
}

export async function getCourseAction(courseId: string, communitySlug: string) {
    const res = await fetch(getUrl(`/api/courses/${courseId}?communitySlug=${communitySlug}`), {
        headers: apiHeaders
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch course")

    return data.course
}