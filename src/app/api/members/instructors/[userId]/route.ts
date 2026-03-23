import { NextRequest, NextResponse } from "next/server"
import { verifyApiRequest } from "@/lib/api"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { userId } = await params

    try {
        const user = await prisma.user.findUnique({
            where: { userId },
            select: {
                userId: true,
                firstName: true,
                lastName: true,
                avatar: true,
            }
        })

        if (!user) return NextResponse.json({ error: "Instructor not found" }, { status: 404 })

        return NextResponse.json({ instructor: user })
    } catch (error) {
        console.error("[INSTRUCTOR_GET]", error)
        return NextResponse.json({ error: "Failed to fetch instructor" }, { status: 500 })
    }
}