import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { withCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const communitySlug = req.nextUrl.searchParams.get('communitySlug')
    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    const cacheKey = `featured:${communitySlug}`

    try {
        const data = await withCache(
            cacheKey,
            async () => {
                const now = new Date()
                const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000)

                // 1. Live session first
                const liveSession = await prisma.session.findFirst({
                    where: {
                        community: { slug: communitySlug },
                        status: 'LIVE',
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        imageUrl: true,
                        scheduledAt: true,
                        duration: true,
                        platformLink: true,
                        status: true,
                    },
                    orderBy: { scheduledAt: 'desc' }
                })

                if (liveSession) {
                    return { type: 'session' as const, item: liveSession, badge: 'live' as const }
                }

                // 2. Upcoming session within 12 hours
                const upcomingSession = await prisma.session.findFirst({
                    where: {
                        community: { slug: communitySlug },
                        status: 'UPCOMING',
                        scheduledAt: { gte: now, lte: in12Hours },
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        imageUrl: true,
                        scheduledAt: true,
                        duration: true,
                        platformLink: true,
                        status: true,
                    },
                    orderBy: { scheduledAt: 'asc' }
                })

                if (upcomingSession) {
                    return { type: 'session' as const, item: upcomingSession, badge: 'upcoming' as const }
                }

                // 3. Fallback: latest active course
                const latestCourse = await prisma.course.findFirst({
                    where: {
                        community: { slug: communitySlug },
                        isActive: true,
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        imageUrl: true,
                        slug: true,
                        createdAt: true,
                        price: true,
                        instructor: {
                            select: {
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            }
                        },
                        _count: {
                            select: { enrollments: true, modules: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                })

                if (latestCourse) {
                    return { type: 'course' as const, item: latestCourse, badge: 'new' as const }
                }

                return null
            },
            { ttl: 60, tags: [`featured:${communitySlug}`, 'sessions', 'courses'] } // short TTL — live status changes fast
        )

        if (!data) return NextResponse.json({ featured: null })
        return NextResponse.json({ featured: data })
    } catch (error) {
        console.error("[FEATURED_GET]", error)
        return NextResponse.json({ error: "Failed to fetch featured" }, { status: 500 })
    }
}