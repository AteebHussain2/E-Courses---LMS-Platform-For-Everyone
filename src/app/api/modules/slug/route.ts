import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { withCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { searchParams } = req.nextUrl
    const courseSlug = searchParams.get('courseSlug')
    const communitySlug = searchParams.get('communitySlug')

    if (!courseSlug || !communitySlug) {
        return NextResponse.json({ error: "At least courseSlug or courseSlug and communitySlug are required" }, { status: 400 })
    }

    const cacheKey = `modules:${courseSlug}:${communitySlug}`

    try {
        const modules = await withCache(
            cacheKey,
            () => prisma.module.findMany({
                where: {
                    course: {
                        slug: courseSlug,
                        community: { slug: communitySlug }
                    },
                    deletedAt: null
                },
                orderBy: { index: 'asc' },
                include: {
                    lessons: {
                        where: { deletedAt: null },
                        select: {
                            id: true,
                            title: true,
                            type: true,
                            status: true,
                            index: true,
                            slug: true,
                            session: true,
                            video: true,
                        },
                        orderBy: { index: 'asc' }
                    }
                }
            }),
            { ttl: 300, tags: ['modules', `modules:${courseSlug}`] }
        )

        return NextResponse.json({ modules })
    } catch (error) {
        console.error("[MODULES_GET]", error)
        return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
    }
}