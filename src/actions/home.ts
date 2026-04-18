"use server"

import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export type FeaturedSession = {
    id: string
    title: string
    description: string | null
    imageUrl: string | null
    scheduledAt: Date | string
    duration: number | null
    platformLink: string | null
    status: string
}

export type FeaturedCourse = {
    id: string
    title: string
    description: string | null
    imageUrl: string
    slug: string
    createdAt: Date | string
    instructor: {
        firstName: string
        lastName: string | null
        avatar: string | null
    } | null
    _count: {
        enrollments: number
        modules: number
    }
}

export type FeaturedData =
    | { type: 'session'; item: FeaturedSession; badge: 'live' | 'upcoming' }
    | { type: 'course'; item: FeaturedCourse; badge: 'new' }

export async function getFeaturedAction(communitySlug: string): Promise<FeaturedData | null> {
    const res = await fetch(getUrl(`/api/home/featured?communitySlug=${communitySlug}`), {
        headers: apiHeaders,
        next: { revalidate: 60, tags: [`featured:${communitySlug}`] }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch featured")

    return data.featured as FeaturedData | null
}

export type FeaturedCourseData = { type: 'course'; item: FeaturedCourse; badge: 'new' }

export async function getFeaturedCourseAction(communitySlug: string): Promise<FeaturedData | null> {
    const res = await fetch(getUrl(`/api/courses/featured?communitySlug=${communitySlug}`), {
        headers: apiHeaders,
        next: { revalidate: 60, tags: [`featured:${communitySlug}`] }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch featured")

    return data.featured as FeaturedData | null
}