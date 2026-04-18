"use server"

import { CourseWithInstructorAndCount } from "@/lib/types";
import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export type StudentCourseFilters = {
    sort?: 'newest' | 'oldest' | 'a-z' | 'z-a' | 'most-enrolled'
    limit?: number
    offset?: number
}

export async function getStudentCoursesAction(
    communitySlug: string,
    filters: StudentCourseFilters = {}
) {
    const params = new URLSearchParams({
        communitySlug,
        status: 'active',  // students only see public courses
        sort: filters.sort ?? 'newest',
        offset: String(filters.offset ?? 0),
        time: 'all',
        instructorId: '',
    })

    const res = await fetch(getUrl(`/api/courses?${params}`), {
        headers: apiHeaders,
        next: {
            revalidate: 300,
            tags: [`courses:${communitySlug}`]
        }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch courses")

    return data as {
        courses: CourseWithInstructorAndCount[]
        total: number
        hasMore: boolean
    }
}