"use server"

import { StatusFilter, TimeFilter, SortFilter } from "@/hooks/use-course-filters";
import { CourseWithInstructorAndCount } from "@/lib/types";
import { courseSchemaType } from "@/lib/schemas/course";
import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export type CourseFilters = {
    status: StatusFilter
    time: TimeFilter
    sort: SortFilter
    instructorId: string
}

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
        headers: apiHeaders,
        next: {
            revalidate: 300,
            tags: ['courses', `courses:${communitySlug}`]
        }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch course")

    return data.course as CourseWithInstructorAndCount
}

export async function getCoursesAction(communitySlug: string, filters: CourseFilters, offset: number = 0) {
    const params = new URLSearchParams({
        communitySlug,
        offset: String(offset),
        ...filters
    })

    const res = await fetch(getUrl(`/api/courses?${params}`), {
        headers: apiHeaders
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch courses")

    return data as {
        courses: CourseWithInstructorAndCount[]
        total: number
        hasMore: boolean
    }
}

export async function deleteCourseAction(courseId: string, communitySlug: string) {
    const res = await fetch(getUrl(`/api/courses/${courseId}`), {
        method: 'DELETE',
        headers: apiHeaders,
        body: JSON.stringify({ communitySlug })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to delete course")

    return data
}