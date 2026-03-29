import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { courseId, communitySlug, order } = await req.json()
    // order: [{ id: string, index: number }]

    if (!courseId || !communitySlug || !order?.length) {
        return NextResponse.json({ error: "courseId, communitySlug and order are required" }, { status: 400 })
    }

    try {
        // verify course belongs to community before reordering
        const course = await prisma.course.findFirst({
            where: { id: courseId, community: { slug: communitySlug } },
            select: { id: true }
        })

        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

        // batch update all indexes in a transaction
        await prisma.$transaction(
            order.map(({ id, index }: { id: string, index: number }) =>
                prisma.module.update({
                    where: { id },
                    data: { index }
                })
            )
        )

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[MODULES_REORDER]", error)
        return NextResponse.json({ error: "Failed to reorder modules" }, { status: 500 })
    }
}