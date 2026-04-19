"use server"

import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export async function enrollCourseAction(userId: string, courseId: string, communitySlug: string) {
    const res = await fetch(getUrl('/api/enrollments'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ userId, courseId, communitySlug })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to enroll")
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