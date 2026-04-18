import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { withCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const communitySlug = req.nextUrl.searchParams.get('communitySlug')
    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    const cacheKey = `featured-course:${communitySlug}`

    try {
        const data = await withCache(
            cacheKey,
            async () => {
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
            { ttl: 1000 * 60, tags: [`featured:${communitySlug}`, 'sessions', 'courses'] }
        )

        if (!data) return NextResponse.json({ featured: null })
        return NextResponse.json({ featured: data })
    } catch (error) {
        console.error("[FEATURED_GET]", error)
        return NextResponse.json({ error: "Failed to fetch featured" }, { status: 500 })
    }
}