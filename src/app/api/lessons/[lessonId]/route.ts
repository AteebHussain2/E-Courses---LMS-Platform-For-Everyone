import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { lessonId } = await params

    try {
        await prisma.lesson.update({
            where: { id: lessonId },
            data: { deletedAt: new Date() },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[LESSON_DELETE]", error)
        return NextResponse.json({ error: "Failed to delete lesson" }, { status: 500 })
    }
}