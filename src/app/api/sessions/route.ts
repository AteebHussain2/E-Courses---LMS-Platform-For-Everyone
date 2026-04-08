import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { SessionStatus } from "@/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { withCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

const getTimeFilter = (time: string) => {
    const now = new Date()
    switch (time) {
        case 'today': return { gte: startOfDay(now) }
        case 'week': return { gte: startOfWeek(now) }
        case 'month': return { gte: startOfMonth(now) }
        case 'year': return { gte: startOfYear(now) }
        default: return undefined
    }
}

const getSortFilter = (sort: string) => {
    switch (sort) {
        case 'oldest': return { createdAt: 'asc' as const }
        case 'a-z': return { title: 'asc' as const }
        case 'z-a': return { title: 'desc' as const }
        case 'most-enrolled': return { title: 'desc' as const } // TODO: ADD A VIEWS TABLE AND FIX THIS
        default: return { createdAt: 'desc' as const }  // newest
    }
}

const LIMIT = 12

export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { searchParams } = req.nextUrl
    const communitySlug = searchParams.get('communitySlug')
    const status = searchParams.get('status') ?? 'all'
    const time = searchParams.get('time') ?? 'all'
    const sort = searchParams.get('sort') ?? 'newest'
    const offset = parseInt(searchParams.get('offset') ?? '0')

    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    const cacheKey = `sessions:${communitySlug}:${status}:${time}:${sort}:${offset}`

    try {
        const where = {
            community: { slug: communitySlug },
            deletedAt: null,
            ...(status === 'upcoming' && { status: SessionStatus.UPCOMING }),
            ...(status === 'live' && { status: SessionStatus.LIVE }),
            ...(status === 'completed' && { status: SessionStatus.COMPLETED }),
            ...(status === 'canceled' && { status: SessionStatus.CANCELLED }),
            ...(time !== 'all' && { createdAt: getTimeFilter(time) }),
        }

        const [sessions, total] = await withCache(
            cacheKey,
            () => prisma.$transaction([
                prisma.session.findMany({
                    where,
                    take: LIMIT,
                    skip: offset,
                    orderBy: getSortFilter(sort),
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        scheduledAt: true,
                        duration: true,
                        platformLink: true,
                        status: true,
                        imageUrl: true,
                        createdAt: true,
                        updatedAt: true,
                        community: {
                            select: {
                                id: true,
                                slug: true,
                            },
                        },
                        recording: {
                            select: {
                                id: true
                            }
                        }
                    }
                }),
                prisma.session.count({ where })
            ]),

            { ttl: 300, tags: ['sessions', `sessions:${communitySlug}`] }
        )

        return NextResponse.json({
            sessions,
            total,
            hasMore: offset + LIMIT < total
        })
    } catch (error) {
        console.error("[COURSES_GET]", error)
        return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
    }
}