import { NextRequest, NextResponse } from "next/server";
import { PostType } from "@/generated/prisma/enums";
import { verifyApiRequest } from "@/lib/api";
import { bustCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

const postSelect = {
    id: true, title: true, content: true, type: true,
    imageUrl: true, isPinned: true, publishedAt: true,
    createdAt: true, updatedAt: true,
    author: { select: { userId: true, firstName: true, lastName: true, avatar: true } },
    community: { select: { id: true, slug: true } },
    pollOptions: {
        select: {
            id: true, text: true,
            votes: { select: { userId: true } }
        }
    },
    reactions: { select: { id: true, emoji: true, userId: true } },
    _count: { select: { reactions: true } }
} as const

export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { postId } = await params

    try {
        const post = await prisma.post.findFirst({
            where: { id: postId, deletedAt: null },
            select: postSelect
        })
        if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 })
        return NextResponse.json({ post })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { postId } = await params
    const { title, content, type, imageUrl, isPinned, publishedAt, communitySlug, pollOptions } = await req.json()

    if (!title || !communitySlug) {
        return NextResponse.json({ error: "title and communitySlug are required" }, { status: 400 })
    }

    try {
        const post = await prisma.$transaction(async (tx) => {
            // If poll options supplied, replace them
            if (type === 'POLL' && pollOptions) {
                await tx.postPollOption.deleteMany({ where: { postId } })
            }

            return tx.post.update({
                where: { id: postId },
                data: {
                    title,
                    content: content || null,
                    type: type as PostType,
                    imageUrl: imageUrl || null,
                    isPinned: isPinned ?? false,
                    publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
                    ...(type === 'POLL' && pollOptions?.length > 0 && {
                        pollOptions: {
                            create: pollOptions.map((text: string) => ({ text }))
                        }
                    })
                },
                select: postSelect
            })
        })

        await bustCache(['posts', `posts:${communitySlug}`])
        return NextResponse.json({ post })
    } catch (error) {
        console.error("[POST_UPDATE]", error)
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { postId } = await params
    const { communitySlug } = await req.json()

    try {
        await prisma.post.update({
            where: { id: postId },
            data: { deletedAt: new Date() }
        })
        await bustCache(['posts', `posts:${communitySlug}`])
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete post" }, { status: 500 })
    }
}