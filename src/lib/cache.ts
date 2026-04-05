"use server";

import { redis } from "./redis";
import { revalidateTag } from "next/cache";

type CacheOptions = {
    ttl?: number
    tags?: string[]
}

// read from cache or fetch from DB
export async function withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
): Promise<T> {
    const { ttl = 300, tags = [] } = options

    try {
        const cached = await redis.get<T>(key)
        if (cached) return cached
    } catch (e) {
        // redis down — fall through to DB, never crash the app
        console.warn("[CACHE] Redis unavailable, falling back to DB", e)
    }

    const data = await fetcher()

    try {
        await redis.setex(key, ttl, JSON.stringify(data))

        if (tags.length > 0) {
            await Promise.all(
                tags.map(tag => redis.sadd(`tag:${tag}`, key))
            )
        }
    } catch (e) {
        console.warn("[CACHE] Failed to write to Redis", e)
    }

    return data
}

// invalidate redis keys by tag + next.js cache by tag
export async function bustCache(tags: string[]) {
    await Promise.all(tags.map(async (tag) => {
        try {
            const keys = await redis.smembers(`tag:${tag}`)
            if (keys.length > 0) {
                // filter out already-expired keys before deleting
                const existing = await Promise.all(
                    keys.map(async key => ({
                        key,
                        exists: await redis.exists(key)
                    }))
                )

                const deadKeys = existing.filter(k => !k.exists).map(k => k.key)
                const liveKeys = existing.filter(k => k.exists).map(k => k.key)

                // delete live keys
                if (liveKeys.length > 0) await redis.del(...liveKeys)

                // clean dead references from tag set
                if (deadKeys.length > 0) {
                    await Promise.all(
                        deadKeys.map(dead => redis.srem(`tag:${tag}`, dead))  // 👈 cleanup
                    )
                }

                await redis.del(`tag:${tag}`)
            }
        } catch (e) {
            console.warn(`[CACHE] Failed to bust tag: ${tag}`, e)
        }

        try {
            revalidateTag(tag, { expire: 0 })
        } catch (e) {
            console.warn(`[CACHE] Failed to revalidate next tag: ${tag}`, e)
        }
    }))
}