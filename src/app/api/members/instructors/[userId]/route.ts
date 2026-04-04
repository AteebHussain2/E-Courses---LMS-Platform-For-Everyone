import { NextRequest, NextResponse } from "next/server"
import { verifyApiRequest } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { withCache } from "@/lib/cache"

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { userId } = await params
    const cacheKey = `instructor:${userId}`

    try {
        const user = await withCache(
            cacheKey,
            () => prisma.user.findUnique({
                where: { userId },
                select: {
                    userId: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                }
            }),
            { ttl: 60 * 60 * 24, tags: [`instructor:${userId}`, `instructors`] }
        )

        if (!user) return NextResponse.json({ error: "Instructor not found" }, { status: 404 })

        return NextResponse.json({ instructor: user })
    } catch (error) {
        console.error("[INSTRUCTOR_GET]", error)
        return NextResponse.json({ error: "Failed to fetch instructor" }, { status: 500 })
    }
}