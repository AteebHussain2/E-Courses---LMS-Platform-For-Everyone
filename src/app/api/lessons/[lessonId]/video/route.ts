import { NextRequest, NextResponse } from "next/server";
import { LessonStatus } from "@/generated/prisma/enums";
import { verifyApiRequest } from "@/lib/api";
import { bustCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { lessonId } = await params
    const { description, imageUrl, videoUrl, duration } = await req.json()

    try {
        const lesson = await prisma.lesson.findFirst({
            where: { id: lessonId, deletedAt: null, type: 'VIDEO' },
            select: { id: true, module: { select: { courseId: true } } }
        })

        if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

        const video = await prisma.video.upsert({
            where: { lessonId },
            create: {
                lessonId,
                description: description || null,
                imageUrl: imageUrl || null,
                videoUrl: videoUrl || null,
                duration: duration || null,
            },
            update: {
                description: description || null,
                imageUrl: imageUrl || null,
                videoUrl: videoUrl || null,
                duration: duration || null,
                deletedAt: null,
            }
        })

        await prisma.lesson.update({
            where: { id: lessonId },
            data: { status: LessonStatus.PUBLISHED }
        })

        await bustCache(['modules', `modules:${lesson.module.courseId}`])

        return NextResponse.json({ video })
    } catch (error) {
        console.error("[VIDEO_UPSERT]", error)
        return NextResponse.json({ error: "Failed to save video" }, { status: 500 })
    }
}