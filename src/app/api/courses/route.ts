import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
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
        case 'most-enrolled': return { enrollments: { _count: 'desc' as const } }
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
    const instructorId = searchParams.get('instructorId') ?? ''
    const offset = parseInt(searchParams.get('offset') ?? '0')

    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    const cacheKey = `courses:${communitySlug}:${status}:${time}:${sort}:${instructorId}:${offset}`

    try {
        const where = {
            community: { slug: communitySlug },
            deletedAt: null,
            ...(status === 'active' && { isActive: true }),
            ...(status === 'inactive' && { isActive: false }),
            ...(time !== 'all' && { createdAt: getTimeFilter(time) }),
            ...(instructorId === 'unassigned' && { instructorId: null }),
            ...(instructorId && instructorId !== 'unassigned' && { instructorId }),
        }

        const [courses, total] = await withCache(
            cacheKey,
            () => prisma.$transaction([
                prisma.course.findMany({
                    where,
                    take: LIMIT,
                    skip: offset,
                    orderBy: getSortFilter(sort),
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                        description: true,
                        imageUrl: true,
                        isActive: true,
                        createdAt: true,
                        updatedAt: true,
                        price: true,
                        instructor: {
                            select: {
                                userId: true,
                                firstName: true,
                                lastName: true,
                                avatar: true,
                            }
                        },
                        community: {
                            select: {
                                id: true,
                                slug: true,
                            },
                        },
                        _count: {
                            select: { enrollments: true, modules: { where: { deletedAt: null } } }
                        }
                    }
                }),
                prisma.course.count({ where })
            ]),

            { ttl: 300, tags: ['courses', `courses:${communitySlug}`] }
        )

        return NextResponse.json({
            courses,
            total,
            hasMore: offset + LIMIT < total
        })
    } catch (error) {
        console.error("[COURSES_GET]", error)
        return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 })
    }
}