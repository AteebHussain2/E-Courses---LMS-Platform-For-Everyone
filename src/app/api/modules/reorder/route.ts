import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { courseId, communitySlug, order } = await req.json()

    if (!courseId || !communitySlug || !order?.length) {
        return NextResponse.json({ error: "courseId, communitySlug and order are required" }, { status: 400 })
    }

    try {
        const course = await prisma.course.findFirst({
            where: { id: courseId, community: { slug: communitySlug } },
            select: { id: true }
        })

        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

        await prisma.$transaction(async (tx) => {
            // pass 1 — set temp fractional values to avoid unique conflicts
            // e.g. 1 → 1.5, 2 → 2.5, 3 → 3.5 (guaranteed no conflict with integers)
            await Promise.all(
                order.map(({ id, index }: { id: string, index: number }) =>
                    tx.module.update({
                        where: { id },
                        data: { index: index + 0.5 }  // 👈 fractional, never conflicts
                    })
                )
            )

            // pass 2 — set final integer values
            await Promise.all(
                order.map(({ id, index }: { id: string, index: number }) =>
                    tx.module.update({
                        where: { id },
                        data: { index }  // 👈 clean final value
                    })
                )
            )
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[MODULES_REORDER]", error)
        return NextResponse.json({ error: "Failed to reorder modules" }, { status: 500 })
    }
}