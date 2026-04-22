"use server"

import { revalidatePath } from "next/cache";
import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";
import { CourseWithInstructorAndCount } from "@/lib/types";
import { StudentCourseFilters } from "./student/courses";

export async function enrollCourseAction(userId: string, courseId: string, communitySlug: string) {
    const res = await fetch(getUrl('/api/enrollments'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ userId, courseId, communitySlug })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to enroll")

    revalidatePath(`/${communitySlug}/courses/${courseId}`) // revalidate course page to show enrolled state

    return data.enrollment
}

export async function checkEnrollmentAction(userId: string, courseId: string) {
    const res = await fetch(getUrl(`/api/enrollments?userId=${userId}&courseId=${courseId}`), {
        headers: apiHeaders,
        next: { revalidate: 60 }
    })
    const data = await res.json()
    if (!res.ok) return null
    return data.enrollment as { id: string; enrolledAt: string; completedAt: string | null } | null
}

export async function getEnrolledCoursesAction(
    userId: string,
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
        userId
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