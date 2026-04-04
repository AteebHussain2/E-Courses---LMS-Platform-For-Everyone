"use server";

import { Role } from "@/generated/prisma/enums";
import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

type Instructor = {
    id: string
    name: string
    avatar: string
    role: Role
}

export async function getInstructors(communitySlug: string) {
    const res = await fetch(getUrl(`/api/members/instructors?communitySlug=${communitySlug}`), {
        headers: apiHeaders,
        next: {
            revalidate: 60 * 60 * 24,                        // 24 hours
            tags: [`instructors:${communitySlug}`]
        }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch instructors")

    return data.members as Instructor[]
}

export async function getInstructorAction(userId: string) {
    const res = await fetch(getUrl(`/api/members/instructors/${userId}`), {
        headers: apiHeaders
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch instructor")

    return data.instructor as {
        userId: string
        firstName: string
        lastName: string
        avatar: string
    }
}