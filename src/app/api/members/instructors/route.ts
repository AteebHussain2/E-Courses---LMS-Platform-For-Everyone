import { NextRequest, NextResponse } from "next/server"
import { verifyApiRequest } from "@/lib/api"
import { prisma } from "@/lib/prisma"
import { Role } from "@/generated/prisma/enums"
import { withCache } from "@/lib/cache"

export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const communitySlug = req.nextUrl.searchParams.get('communitySlug')
    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    const cacheKey = `instructors:${communitySlug}`

    try {
        const members = await withCache(
            cacheKey,
            () => prisma.communityMember.findMany({
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
            }),
            { ttl: 60 * 60 * 24, tags: [`instructors:${communitySlug}`] } // 24 hours — instructors barely change 
        )

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