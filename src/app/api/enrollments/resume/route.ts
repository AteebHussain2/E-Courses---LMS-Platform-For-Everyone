import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { searchParams } = req.nextUrl
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')

    if (!userId || !courseId) {
        return NextResponse.json({ error: "userId and courseId are required" }, { status: 400 })
    }

    try {
        // 1. Last watched video lesson in this course
        const lastWatched = await prisma.watchProgress.findFirst({
            where: {
                userId,
                video: {
                    lesson: {
                        deletedAt: null,
                        status: 'PUBLISHED',
                        module: { courseId, deletedAt: null }
                    }
                }
            },
            orderBy: { lastWatchedAt: 'desc' },
            select: {
                video: {
                    select: {
                        lesson: {
                            select: { id: true, title: true, type: true, slug: true }
                        }
                    }
                }
            }
        })

        if (lastWatched?.video?.lesson) {
            return NextResponse.json({ lesson: lastWatched.video.lesson, source: 'progress' })
        }

        // 2. Fallback: first published lesson in the first module
        const firstLesson = await prisma.lesson.findFirst({
            where: {
                deletedAt: null,
                status: 'PUBLISHED',
                module: { courseId, deletedAt: null }
            },
            orderBy: [
                { module: { index: 'asc' } },
                { index: 'asc' }
            ],
            select: { id: true, title: true, type: true, slug: true }
        })

        if (!firstLesson) {
            return NextResponse.json({ error: "No lessons available" }, { status: 404 })
        }

        return NextResponse.json({ lesson: firstLesson, source: 'first' })
    } catch (error) {
        console.error("[RESUME_LESSON]", error)
        return NextResponse.json({ error: "Failed to get resume lesson" }, { status: 500 })
    }
}