import { NextRequest, NextResponse } from "next/server";
import { bustCache, withCache } from "@/lib/cache";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

// GET to check if saved OR get all saved courses for user
export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { searchParams } = req.nextUrl
    const userId = searchParams.get('userId')
    const communitySlug = searchParams.get('communitySlug')
    const courseId = searchParams.get('courseId') // optional for single check only

    if (!userId || !communitySlug) {
        return NextResponse.json({ error: "userId and communitySlug are required" }, { status: 400 })
    }

    try {
        // Single course saved-check
        if (courseId) {
            const saved = await prisma.savedCourse.findUnique({
                where: { userId_courseId: { userId, courseId } },
                select: { id: true, savedAt: true }
            })
            return NextResponse.json({ saved: !!saved, savedAt: saved?.savedAt ?? null })
        }

        // Full library
        const cacheKey = `library:${userId}:${communitySlug}`

        const courses = await withCache(
            cacheKey,
            () => prisma.savedCourse.findMany({
                where: {
                    userId,
                    course: {
                        community: { slug: communitySlug },
                        isActive: true,
                        deletedAt: null,
                    }
                },
                orderBy: { savedAt: 'desc' },
                select: {
                    savedAt: true,
                    course: {
                        select: {
                            id: true,
                            title: true,
                            slug: true,
                            description: true,
                            imageUrl: true,
                            isActive: true,
                            price: true,
                            createdAt: true,
                            updatedAt: true,
                            instructor: {
                                select: {
                                    userId: true,
                                    firstName: true,
                                    lastName: true,
                                    avatar: true,
                                }
                            },
                            community: { select: { id: true, slug: true } },
                            _count: {
                                select: {
                                    enrollments: true,
                                    modules: { where: { deletedAt: null } }
                                }
                            }
                        }
                    }
                }
            }),
            { ttl: 120, tags: [`library:${userId}`, `courses:${communitySlug}`] }
        )

        return NextResponse.json({
            courses: courses.map(s => ({ ...s.course, savedAt: s.savedAt }))
        })
    } catch (error) {
        console.error("[LIBRARY_GET]", error)
        return NextResponse.json({ error: "Failed to fetch library" }, { status: 500 })
    }
}

// POST for toggle save/unsave
export async function POST(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { userId, courseId, communitySlug } = await req.json()

    if (!userId || !courseId || !communitySlug) {
        return NextResponse.json({ error: "userId, courseId and communitySlug are required" }, { status: 400 })
    }

    try {
        const existing = await prisma.savedCourse.findUnique({
            where: { userId_courseId: { userId, courseId } }
        })

        if (existing) {
            await prisma.savedCourse.delete({
                where: { userId_courseId: { userId, courseId } }
            })
            await bustCache([`library:${userId}`])
            return NextResponse.json({ saved: false })
        } else {
            // Verify course exists and is active
            const course = await prisma.course.findFirst({
                where: { id: courseId, community: { slug: communitySlug }, isActive: true, deletedAt: null },
                select: { id: true }
            })
            if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

            await prisma.savedCourse.create({ data: { userId, courseId } })
            await bustCache([`library:${userId}`])
            return NextResponse.json({ saved: true })
        }
    } catch (error) {
        console.error("[LIBRARY_TOGGLE]", error)
        return NextResponse.json({ error: "Failed to update library" }, { status: 500 })
    }
}