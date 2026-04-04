import { verifyApiRequest, generateSlug } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bustCache, withCache } from "@/lib/cache";

export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { searchParams } = req.nextUrl
    const courseId = searchParams.get('courseId')
    const communitySlug = searchParams.get('communitySlug')

    if (!courseId || !communitySlug) {
        return NextResponse.json({ error: "courseId and communitySlug are required" }, { status: 400 })
    }

    const cacheKey = `modules:${courseId}:${communitySlug}`

    try {
        const modules = await withCache(
            cacheKey,
            () => prisma.module.findMany({
                where: {
                    courseId,
                    course: { community: { slug: communitySlug } },
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
                            index: true,
                            slug: true,
                            session: true,
                            video: true,
                        },
                        orderBy: { index: 'asc' }
                    }
                }
            }),
            { ttl: 300, tags: ['modules', `modules:${courseId}`] }
        )

        return NextResponse.json({ modules })
    } catch (error) {
        console.error("[MODULES_GET]", error)
        return NextResponse.json({ error: "Failed to fetch modules" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { title, courseId, communitySlug } = await req.json()

    if (!title || !courseId || !communitySlug) {
        return NextResponse.json({ error: "title, courseId and communitySlug are required" }, { status: 400 })
    }

    try {
        // get current max index to append new module at the end
        const lastModule = await prisma.module.findFirst({
            where: { courseId, deletedAt: null },
            orderBy: { index: 'desc' },
            select: { index: true }
        })

        const index = (lastModule?.index ?? 0) + 1
        const slug = generateSlug(title)

        const module = await prisma.module.create({
            data: {
                title,
                slug,
                index,
                course: { connect: { id: courseId } }
            }
        })

        await bustCache(['modules', `modules:${courseId}`])

        return NextResponse.json({ module }, { status: 201 })
    } catch (error) {
        console.error("[MODULE_CREATE]", error)
        return NextResponse.json({ error: "Failed to create module" }, { status: 500 })
    }
}