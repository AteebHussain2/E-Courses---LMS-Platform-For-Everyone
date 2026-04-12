import { validateWithRegex, verifyApiRequest } from "@/lib/api";
import { SessionStatus } from "@/generated/prisma/enums";
import { NextRequest, NextResponse } from "next/server";
import { bustCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { sessionId } = await params
    const communitySlug = req.nextUrl.searchParams.get('communitySlug')
    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    try {
        const session = await prisma.session.findFirst({
            where: { id: sessionId, community: { slug: communitySlug }, deletedAt: null },
            select: {
                id: true, title: true, description: true, scheduledAt: true,
                duration: true, platformLink: true, imageUrl: true, status: true,
                createdAt: true, updatedAt: true,
                community: { select: { id: true, slug: true } },
                recording: { select: { id: true } },
                lesson: {
                    select: {
                        id: true, title: true,
                        module: {
                            select: {
                                id: true, title: true,
                                course: { select: { id: true, title: true, slug: true } }
                            }
                        }
                    }
                }
            }
        })

        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 })
        return NextResponse.json({ session })
    } catch (error) {
        console.error("[SESSION_GET]", error)
        return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { sessionId } = await params
    const { title, description, scheduledAt, duration, platformLink, imageUrl, status, communitySlug, lessonId, unlinkLesson } = await req.json()

    if (!title || !scheduledAt || !communitySlug) {
        return NextResponse.json({ error: "title, scheduledAt and communitySlug are required" }, { status: 400 })
    }

    try {
        const session = await prisma.$transaction(async (tx) => {
            const updated = await tx.session.update({
                where: { id: sessionId, community: { slug: communitySlug } },
                data: {
                    title,
                    description: description || null,
                    scheduledAt: new Date(scheduledAt),
                    duration: duration || null,
                    platformLink: platformLink || null,
                    imageUrl: imageUrl || null,
                    status: status ?? SessionStatus.UPCOMING,
                    deletedAt: null,
                }
            })

            // unlink old lesson if requested
            if (unlinkLesson) {
                await tx.lesson.updateMany({
                    where: { sessionId: sessionId },
                    data: { sessionId: null }
                })
            }

            // link to new lesson if provided
            if (lessonId) {
                // first detach from any previous lesson
                await tx.lesson.updateMany({
                    where: { sessionId: sessionId },
                    data: { sessionId: null }
                })
                await tx.lesson.update({
                    where: { id: lessonId },
                    data: { sessionId: sessionId }
                })
            }

            return updated
        })

        await bustCache(['sessions', `sessions:${communitySlug}`])

        return NextResponse.json({ session })
    } catch (error) {
        console.error("[SESSION_UPDATE]", error)
        return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { sessionId } = await params
    const { communitySlug } = await req.json()

    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    try {
        await prisma.$transaction([
            // unlink any lesson pointing to this session
            prisma.lesson.updateMany({
                where: { sessionId },
                data: { sessionId: null }
            }),
            prisma.session.update({
                where: { id: sessionId },
                data: { deletedAt: new Date() }
            })
        ]);

        await bustCache(['sessions', `sessions:${communitySlug}`]);

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[SESSION_DELETE]", error)
        return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
    }
}