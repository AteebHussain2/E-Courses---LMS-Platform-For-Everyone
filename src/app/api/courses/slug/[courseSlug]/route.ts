import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseSlug: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { courseSlug } = await params;
    const communitySlug = req.nextUrl.searchParams.get('communitySlug')
    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    try {
        const course = await prisma.course.findFirst({
            where: {
                slug: courseSlug,
                community: { slug: communitySlug }
            },
            select: {
                id: true,
                title: true,
                slug: true,
                description: true,
                imageUrl: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                price: true,
                instructor: {
                    select: {
                        userId: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                    }
                },
                community: {
                    select: {
                        id: true,
                        slug: true,
                    },
                },
                _count: {
                    select: { enrollments: true, modules: true }
                }
            }
        })

        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

        return NextResponse.json({ course })
    } catch (error) {
        console.error("[COURSE_GET]", error)
        return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
    }
}