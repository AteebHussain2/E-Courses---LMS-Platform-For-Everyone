import { NextRequest, NextResponse } from "next/server"
import { verifyApiRequest } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { Role } from "@/generated/prisma/enums"

export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const communitySlug = req.nextUrl.searchParams.get('communitySlug')
    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    try {
        const members = await prisma.communityMember.findMany({
            where: {
                community: { slug: communitySlug },
                role: { not: Role.STUDENT }
            },
            select: {
                user: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    }
                },
                role: true
            }
        })

        return NextResponse.json({
            members: members.map(m => ({
                id: m.user.userId,
                name: `${m.user.firstName} ${m.user.lastName}`,
                avatar: m.user.avatar,
                role: m.role
            }))
        })
    } catch (error) {
        console.error("[INSTRUCTORS_GET]", error)
        return NextResponse.json({ error: "Failed to fetch instructors" }, { status: 500 })
    }
}