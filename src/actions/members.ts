"use server"

import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export async function getInstructors(communitySlug: string) {
    const res = await fetch(getUrl(`/api/members/instructors?communitySlug=${communitySlug}`), {
        headers: apiHeaders
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch instructors")

    return data.members
}