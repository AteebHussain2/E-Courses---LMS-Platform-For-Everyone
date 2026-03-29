import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { moduleId, courseId, communitySlug, order } = await req.json()

    if (!moduleId || !courseId || !communitySlug || !order?.length) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    try {
        const module = await prisma.module.findFirst({
            where: {
                id: moduleId,
                courseId,
                course: { community: { slug: communitySlug } },
                deletedAt: null
            },
            select: { id: true }
        })

        if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 })

        await prisma.$transaction(async (tx) => {
            // pass 1 — fractional to avoid unique constraint conflicts
            await Promise.all(
                order.map(({ id, index }: { id: string, index: number }) =>
                    tx.lesson.update({
                        where: { id },
                        data: { index: index + 0.5 }
                    })
                )
            )

            // pass 2 — final integer values
            await Promise.all(
                order.map(({ id, index }: { id: string, index: number }) =>
                    tx.lesson.update({
                        where: { id },
                        data: { index }
                    })
                )
            )
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[LESSONS_REORDER]", error)
        return NextResponse.json({ error: "Failed to reorder lessons" }, { status: 500 })
    }
}