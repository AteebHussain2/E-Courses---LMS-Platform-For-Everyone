import { validateWithRegex, verifyApiRequest } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { bustCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { sessionId } = await params;
    const communitySlug = req.nextUrl.searchParams.get('communitySlug')
    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    try {
        const session = await prisma.session.findFirst({
            where: {
                id: sessionId,
                community: { slug: communitySlug }
            },
            select: {
                id: true,
                title: true,
                description: true,
                scheduledAt: true,
                duration: true,
                platformLink: true,
                imageUrl: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                community: {
                    select: {
                        id: true,
                        slug: true,
                    },
                },
            }
        })

        if (!session) return NextResponse.json({ error: "Course not found" }, { status: 404 })

        return NextResponse.json({ session })
    } catch (error) {
        console.error("[COURSE_GET]", error)
        return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 })
    }
}