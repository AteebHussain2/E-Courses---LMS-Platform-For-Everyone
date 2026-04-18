import { validateWithRegex, verifyApiRequest } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { bustCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

const PATTERNS = {
    title: /^[a-zA-Z0-9\s\-\_\:\&]{1,100}$/,
    description: /^[\s\S]{0,2000}$/,
    communitySlug: /^[a-z0-9-]{1,55}$/,
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { courseId } = await params;
    const communitySlug = req.nextUrl.searchParams.get('communitySlug')
    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    try {
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                community: { slug: communitySlug }
            },
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
                    select: { enrollments: true, modules: true }
                }
            }
        })

        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

        return NextResponse.json({ course })
    } catch (error) {
        console.error("[COURSE_GET]", error)
        return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { courseId } = await params
    const body = await req.json()
    const { title, description, communitySlug, isActive, imageUrl, instructorId, price } = body

    if (!title || !communitySlug) {
        return NextResponse.json({ error: "title and communitySlug are required" }, { status: 400 })
    }

    const checks = [
        { value: title, pattern: PATTERNS.title, field: "title" },
        { value: communitySlug, pattern: PATTERNS.communitySlug, field: "communitySlug" },
        ...(description ? [{ value: description, pattern: PATTERNS.description, field: "description" }] : [])
    ]

    for (const { value, pattern, field } of checks) {
        const error = validateWithRegex(value, pattern, field)
        if (error) return error
    }

    try {
        const course = await prisma.course.update({
            where: {
                id: courseId,
                community: { slug: communitySlug }
            },
            data: {
                title,
                description,
                imageUrl,
                price: price ?? 0,
                isActive: isActive ?? false,
                ...(instructorId ? {
                    instructor: { connect: { userId: instructorId } }
                } : {
                    instructor: { disconnect: true }  // clears instructor if removed
                })
            }
        })

        await bustCache(['courses', `courses:${communitySlug}`])

        return NextResponse.json({ course })
    } catch (error) {
        console.error("[COURSE_UPDATE]", error)
        return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { courseId } = await params
    const body = await req.json()
    const { communitySlug } = body

    if (!communitySlug) {
        return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })
    }

    try {
        const now = new Date()

        // Fetch all nested IDs before touching anything
        const modules = await prisma.module.findMany({
            where: { courseId },
            select: {
                id: true,
                lessons: {
                    select: {
                        id: true,
                        video: { select: { id: true } },
                        session: {
                            select: {
                                id: true,
                                recording: { select: { id: true } }
                            }
                        }
                    }
                }
            }
        })

        const lessonIds = modules.flatMap(m => m.lessons.map(l => l.id))
        const videoLessonIds = modules.flatMap(m => m.lessons.filter(l => l.video).map(l => l.id))
        const sessionIds = modules.flatMap(m => m.lessons.filter(l => l.session).map(l => l.session!.id))
        const recordingSessionIds = modules.flatMap(m =>
            m.lessons.filter(l => l.session?.recording).map(l => l.session!.id)
        )
        const moduleIds = modules.map(m => m.id)

        await prisma.$transaction(async (tx) => {
            if (recordingSessionIds.length > 0)
                await tx.recording.updateMany({ where: { sessionId: { in: recordingSessionIds } }, data: { deletedAt: now } })

            if (sessionIds.length > 0)
                await tx.session.updateMany({ where: { id: { in: sessionIds } }, data: { deletedAt: now } })

            if (videoLessonIds.length > 0)
                await tx.video.updateMany({ where: { lessonId: { in: videoLessonIds } }, data: { deletedAt: now } })

            if (lessonIds.length > 0)
                await tx.lesson.updateMany({ where: { id: { in: lessonIds } }, data: { deletedAt: now } })

            if (moduleIds.length > 0)
                await tx.module.updateMany({ where: { id: { in: moduleIds } }, data: { deletedAt: now } })

            await tx.course.update({
                where: { id: courseId },
                data: { deletedAt: now, isActive: false }
            })
        })

        await bustCache(['courses', `courses:${communitySlug}`])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[COURSE_DELETE]", error)
        return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
    }
}