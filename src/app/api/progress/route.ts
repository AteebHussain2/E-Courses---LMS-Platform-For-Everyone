import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// GET — fetch progress for a user across a course's lessons
// ?userId=&courseId=
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
        const [watchProgress, completions] = await Promise.all([
            prisma.watchProgress.findMany({
                where: {
                    userId,
                    video: {
                        lesson: {
                            module: { courseId, deletedAt: null },
                            deletedAt: null,
                        }
                    }
                },
                select: {
                    percent: true,
                    completedAt: true,
                    video: { select: { lessonId: true } }
                }
            }),
            prisma.lessonCompletion.findMany({
                where: {
                    userId,
                    lesson: {
                        module: { courseId, deletedAt: null },
                        deletedAt: null,
                    }
                },
                select: { lessonId: true, completedAt: true }
            })
        ])

        // Shape: { [lessonId]: { percent, completedAt, isComplete } }
        const progressMap: Record<string, { percent: number; isComplete: boolean; completedAt: string | null }> = {}

        for (const wp of watchProgress) {
            const lessonId = wp.video?.lessonId!
            progressMap[lessonId] = {
                percent: wp.percent,
                isComplete: false,
                completedAt: null,
            }
        }

        for (const c of completions) {
            if (progressMap[c.lessonId]) {
                progressMap[c.lessonId].isComplete = true
                progressMap[c.lessonId].completedAt = c.completedAt.toISOString()
            } else {
                progressMap[c.lessonId] = {
                    percent: 100,
                    isComplete: true,
                    completedAt: c.completedAt.toISOString(),
                }
            }
        }

        return NextResponse.json({ progress: progressMap })
    } catch (error) {
        console.error("[PROGRESS_GET]", error)
        return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 })
    }
}

// PATCH — upsert watch progress for a single video lesson
// body: { userId, lessonId, videoId, percent }
export async function PATCH(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { userId, lessonId, videoId, percent } = await req.json()

    if (!userId || !lessonId || !videoId || percent === undefined) {
        return NextResponse.json({ error: "userId, lessonId, videoId, percent required" }, { status: 400 })
    }

    const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)))

    try {
        const progress = await prisma.watchProgress.upsert({
            where: { userId_videoId: { userId, videoId } },
            create: {
                userId,
                videoId,
                percent: clampedPercent,
                // auto-complete if >= 90%
                completedAt: clampedPercent >= 90 ? new Date() : null,
            },
            update: {
                percent: clampedPercent,
                completedAt: clampedPercent >= 90 ? new Date() : undefined,
            }
        })

        return NextResponse.json({ progress })
    } catch (error) {
        console.error("[PROGRESS_PATCH]", error)
        return NextResponse.json({ error: "Failed to update progress" }, { status: 500 })
    }
}