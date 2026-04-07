import { LessonStatus, LessonType, SessionStatus } from "@/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { bustCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { lessonId } = await params
    const { title, description, scheduledAt, duration, platformLink, imageUrl, status } = await req.json()

    if (!title || !scheduledAt) {
        return NextResponse.json({ error: "title and scheduledAt are required" }, { status: 400 })
    }

    try {
        const lesson = await prisma.lesson.findFirst({
            where: { id: lessonId, deletedAt: null, type: LessonType.SESSION },
            select: {
                id: true,
                sessionId: true,
                module: {
                    select: {
                        courseId: true,
                        course: { select: { communityId: true } }
                    }
                }
            }
        })

        if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

        const sessionData = {
            title,
            description: description || null,
            scheduledAt: new Date(scheduledAt),
            duration: duration || null,
            platformLink: platformLink || null,
            imageUrl: imageUrl || null,
            status: status ?? SessionStatus.UPCOMING,
        }

        let session

        if (lesson.sessionId) {
            // Update existing session
            session = await prisma.session.update({
                where: { id: lesson.sessionId },
                data: { ...sessionData, deletedAt: null }
            })
        } else {
            // Create session and link it to the lesson in a transaction
            session = await prisma.$transaction(async (tx) => {
                const created = await tx.session.create({
                    data: {
                        ...sessionData,
                        communityId: lesson.module.course.communityId,
                    }
                })
                await tx.lesson.update({
                    where: { id: lessonId },
                    data: { sessionId: created.id, status: LessonStatus.PUBLISHED }
                })
                return created
            })
        }

        await bustCache(['modules', `modules:${lesson.module.courseId}`])

        return NextResponse.json({ session })
    } catch (error) {
        console.error("[SESSION_UPSERT]", error)
        return NextResponse.json({ error: "Failed to save session" }, { status: 500 })
    }
}