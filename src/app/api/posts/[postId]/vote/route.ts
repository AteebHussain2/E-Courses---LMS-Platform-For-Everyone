import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { bustCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { postId } = await params
    const { optionId, userId, communitySlug } = await req.json()

    if (!optionId || !userId) return NextResponse.json({ error: "optionId and userId are required" }, { status: 400 })

    try {
        // Check user hasn't already voted on this post (single-choice enforcement)
        const existingVote = await prisma.postPollVote.findFirst({
            where: {
                userId,
                option: { postId }
            }
        })

        if (existingVote) {
            // Toggle: if same option, remove vote; if different option, switch
            if (existingVote.optionId === optionId) {
                await prisma.postPollVote.delete({ where: { id: existingVote.id } })
            } else {
                await prisma.$transaction([
                    prisma.postPollVote.delete({ where: { id: existingVote.id } }),
                    prisma.postPollVote.create({ data: { optionId, userId } })
                ])
            }
        } else {
            await prisma.postPollVote.create({ data: { optionId, userId } })
        }

        if (communitySlug) await bustCache(['posts', `posts:${communitySlug}`])

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[POLL_VOTE]", error)
        return NextResponse.json({ error: "Failed to vote" }, { status: 500 })
    }
}