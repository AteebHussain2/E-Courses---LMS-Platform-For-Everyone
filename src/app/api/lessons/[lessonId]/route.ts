import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { lessonId } = await params
    const now = new Date()

    try {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            select: {
                video: { select: { id: true } },
                session: {
                    select: {
                        id: true,
                        recording: { select: { id: true } }
                    }
                }
            }
        })

        if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 })

        await prisma.lesson.update({
            where: { id: lessonId },
            data: {
                deletedAt: now,
                // only update video if it exists
                ...(lesson.video && {
                    video: {
                        update: { deletedAt: now }
                    }
                }),
                // only update session if it exists
                ...(lesson.session && {
                    session: {
                        update: {
                            deletedAt: now,
                            // only update recording if session has one
                            ...(lesson.session.recording && {
                                recording: {
                                    update: { deletedAt: now }
                                }
                            })
                        }
                    }
                })
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[LESSON_DELETE]", error)
        return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
    }
}