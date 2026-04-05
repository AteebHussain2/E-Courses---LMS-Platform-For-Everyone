import { NextRequest, NextResponse } from "next/server";
import { generateSlug, verifyApiRequest } from "@/lib/api";
import { bustCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { moduleId } = await params
    const { title, communitySlug } = await req.json()

    if (!title || !communitySlug) {
        return NextResponse.json({ error: "title and communitySlug are required" }, { status: 400 })
    }

    try {
        const module = await prisma.module.findFirst({
            where: { id: moduleId, deletedAt: null },
            select: { id: true, courseId: true }
        })

        if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 })

        const slug = generateSlug(title)

        const updated = await prisma.module.update({
            where: { id: moduleId },
            data: { title, slug }
        })

        await bustCache(['modules', `modules:${module.courseId}`])

        return NextResponse.json({ module: updated })
    } catch (error) {
        console.error("[MODULE_UPDATE]", error)
        return NextResponse.json({ error: "Failed to update module" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ moduleId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { moduleId } = await params

    try {
        const module = await prisma.module.findUnique({
            where: { id: moduleId },
            include: {
                lessons: {
                    select: {
                        id: true,
                        sessionId: true,
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

        if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 })

        const now = new Date()

        await prisma.$transaction(async (tx) => {
            // soft delete all videos
            const videoLessonIds = module.lessons
                .filter(l => l.video)
                .map(l => l.id)

            if (videoLessonIds.length > 0) {
                await tx.video.updateMany({
                    where: { lessonId: { in: videoLessonIds } },
                    data: { deletedAt: now }
                })
            }

            // soft delete all recordings
            const recordingSessionIds = module.lessons
                .filter(l => l.session?.recording)
                .map(l => l.session!.id)

            if (recordingSessionIds.length > 0) {
                await tx.recording.updateMany({
                    where: { sessionId: { in: recordingSessionIds } },
                    data: { deletedAt: now }
                })
            }

            // soft delete all sessions
            const sessionIds = module.lessons
                .filter(l => l.session)
                .map(l => l.session!.id)

            if (sessionIds.length > 0) {
                await tx.session.updateMany({
                    where: { id: { in: sessionIds } },
                    data: { deletedAt: now }
                })
            }

            // soft delete all lessons
            await tx.lesson.updateMany({
                where: { moduleId },
                data: { deletedAt: now }
            })

            // soft delete module
            await tx.module.update({
                where: { id: moduleId },
                data: { deletedAt: now }
            })
        })

        // bust after delete
        await bustCache(['modules', `modules:${module.courseId}`])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[MODULE_DELETE]", error)
        return NextResponse.json({ error: "Failed to delete module" }, { status: 500 })
    }
}