import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// POST — toggle lesson completion
// body: { userId, lessonId }
export async function POST(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { userId, lessonId } = await req.json()

    if (!userId || !lessonId) {
        return NextResponse.json({ error: "userId and lessonId are required" }, { status: 400 })
    }

    try {
        const existing = await prisma.lessonCompletion.findUnique({
            where: { userId_lessonId: { userId, lessonId } }
        })

        if (existing) {
            // Toggle off — unmark complete
            await prisma.lessonCompletion.delete({
                where: { userId_lessonId: { userId, lessonId } }
            })
            return NextResponse.json({ isComplete: false })
        }

        await prisma.lessonCompletion.create({ data: { userId, lessonId } })

        return NextResponse.json({ isComplete: true })
    } catch (error) {
        console.error("[LESSON_COMPLETE]", error)
        return NextResponse.json({ error: "Failed to toggle completion" }, { status: 500 })
    }
}