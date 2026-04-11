"use server"

import { apiHeaders } from "@/lib/api";
import { getUrl } from "@/lib/utils";

export type PostType = 'POST' | 'ANNOUNCEMENT' | 'POLL'
export type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all'
export type SortFilter = 'newest' | 'oldest'

export type PostFilters = {
    type: PostType | 'all'
    time: TimeFilter
    sort: SortFilter
}

export type PostPollOption = {
    id: string
    text: string
    votes: { userId: string }[]
}

export type PostWithDetails = {
    id: string
    title: string
    content: string | null
    type: PostType
    imageUrl: string | null
    isPinned: boolean
    publishedAt: string | null
    createdAt: string
    updatedAt: string
    author: { userId: string; firstName: string; lastName: string; avatar: string | null } | null
    community: { id: string; slug: string }
    pollOptions: PostPollOption[]
    reactions: { id: string; emoji: string; userId: string }[]
    _count: { reactions: number }
}

export async function getPostsAction(communitySlug: string, filters: PostFilters, offset = 0) {
    const params = new URLSearchParams({
        communitySlug,
        offset: String(offset),
        type: filters.type,
        time: filters.time,
        sort: filters.sort,
    })

    const res = await fetch(getUrl(`/api/posts?${params}`), {
        headers: apiHeaders,
        next: { revalidate: 60, tags: ['posts', `posts:${communitySlug}`] }
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch posts")

    return data as { posts: PostWithDetails[]; total: number; hasMore: boolean }
}

export async function getPostAction(postId: string) {
    const res = await fetch(getUrl(`/api/posts/${postId}`), {
        headers: apiHeaders,
        next: { revalidate: 60, tags: ['posts'] }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to fetch post")
    return data.post as PostWithDetails
}

export async function createPostAction(payload: {
    title: string
    content?: string
    type: PostType
    imageUrl?: string
    isPinned?: boolean
    publishedAt?: string
    communitySlug: string
    authorId: string
    pollOptions?: string[]
}) {
    const res = await fetch(getUrl('/api/posts'), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to create post")
    return data.post as PostWithDetails
}

export async function updatePostAction(postId: string, payload: {
    title: string
    content?: string
    type: PostType
    imageUrl?: string
    isPinned?: boolean
    publishedAt?: string
    communitySlug: string
    pollOptions?: string[]
}) {
    const res = await fetch(getUrl(`/api/posts/${postId}`), {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify(payload)
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to update post")
    return data.post as PostWithDetails
}

export async function deletePostAction(postId: string, communitySlug: string) {
    const res = await fetch(getUrl(`/api/posts/${postId}`), {
        method: 'DELETE',
        headers: apiHeaders,
        body: JSON.stringify({ communitySlug })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to delete post")
    return data
}

export async function voteOnPollAction(postId: string, optionId: string, userId: string, communitySlug: string) {
    const res = await fetch(getUrl(`/api/posts/${postId}/vote`), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ optionId, userId, communitySlug })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to vote")
    return data
}

export async function reactToPostAction(postId: string, emoji: string, userId: string, communitySlug: string) {
    const res = await fetch(getUrl(`/api/posts/${postId}/react`), {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ emoji, userId, communitySlug })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Failed to react")
    return data
}