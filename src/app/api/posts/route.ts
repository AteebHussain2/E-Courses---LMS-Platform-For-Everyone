import { startOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
import { generateSlug, verifyApiRequest } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { PostType } from "@/generated/prisma/enums";
import { bustCache, withCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

const LIMIT = 12

const getTimeFilter = (time: string) => {
    const now = new Date()
    switch (time) {
        case 'today': return { gte: startOfDay(now) }
        case 'week': return { gte: startOfWeek(now) }
        case 'month': return { gte: startOfMonth(now) }
        case 'year': return { gte: startOfYear(now) }
        default: return undefined
    }
}

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

export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { searchParams } = req.nextUrl
    const communitySlug = searchParams.get('communitySlug')
    const type = searchParams.get('type') ?? 'all'
    const time = searchParams.get('time') ?? 'all'
    const sort = searchParams.get('sort') ?? 'newest'
    const offset = parseInt(searchParams.get('offset') ?? '0')

    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    const cacheKey = `posts:${communitySlug}:${type}:${time}:${sort}:${offset}`

    try {
        const where = {
            community: { slug: communitySlug },
            deletedAt: null,
            publishedAt: { not: null, lte: new Date() }, // only published
            ...(type !== 'all' && { type: type.toUpperCase() as PostType }),
            ...(time !== 'all' && { createdAt: getTimeFilter(time) }),
        }

        const orderBy = sort === 'oldest'
            ? [{ isPinned: 'desc' as const }, { createdAt: 'asc' as const }]
            : [{ isPinned: 'desc' as const }, { createdAt: 'desc' as const }]

        const [posts, total] = await withCache(
            cacheKey,
            () => prisma.$transaction([
                prisma.post.findMany({ where, take: LIMIT, skip: offset, orderBy, select: postSelect }),
                prisma.post.count({ where })
            ]),
            { ttl: 60, tags: ['posts', `posts:${communitySlug}`] }
        )

        return NextResponse.json({ posts, total, hasMore: offset + LIMIT < total })
    } catch (error) {
        console.error("[POSTS_GET]", error)
        return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { title, content, type, imageUrl, isPinned, publishedAt, communitySlug, authorId, pollOptions } = await req.json()

    if (!title || !type || !communitySlug || !authorId) {
        return NextResponse.json({ error: "title, type, communitySlug and authorId are required" }, { status: 400 })
    }

    if (type === PostType.POLL && (!pollOptions || pollOptions.length < 2)) {
        return NextResponse.json({ error: "Polls need at least 2 options" }, { status: 400 })
    }

    try {
        const post = await prisma.post.create({
            data: {
                title,
                content: content || null,
                type: type as PostType,
                imageUrl: imageUrl || null,
                isPinned: isPinned ?? false,
                publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
                community: { connect: { slug: communitySlug } },
                author: { connect: { userId: authorId } },
                ...(type === 'POLL' && pollOptions?.length > 0 && {
                    pollOptions: {
                        create: pollOptions.map((text: string) => ({ text }))
                    }
                })
            },
            select: postSelect
        })

        await bustCache(['posts', `posts:${communitySlug}`])

        return NextResponse.json({ post }, { status: 201 })
    } catch (error) {
        console.error("[POST_CREATE]", error)
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
    }
}