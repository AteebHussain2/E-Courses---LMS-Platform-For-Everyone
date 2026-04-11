import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { bustCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

const ALLOWED_EMOJIS = ['❤️', '👍', '🔥', '😂', '😮']

export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { postId } = await params
    const { emoji, userId, communitySlug } = await req.json()

    if (!emoji || !userId) return NextResponse.json({ error: "emoji and userId are required" }, { status: 400 })
    if (!ALLOWED_EMOJIS.includes(emoji)) return NextResponse.json({ error: "Invalid emoji" }, { status: 400 })

    try {
        const existing = await prisma.postReaction.findUnique({
            where: { postId_userId_emoji: { postId, userId, emoji } }
        })

        if (existing) {
            await prisma.postReaction.delete({ where: { id: existing.id } })
        } else {
            await prisma.postReaction.create({ data: { postId, userId, emoji } })
        }

        if (communitySlug) await bustCache(['posts', `posts:${communitySlug}`])

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to react" }, { status: 500 })
    }
}