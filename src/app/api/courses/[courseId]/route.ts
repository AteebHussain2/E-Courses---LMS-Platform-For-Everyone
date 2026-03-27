import { validateWithRegex, verifyApiRequest } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PATTERNS = {
    title: /^[a-zA-Z0-9\s\-\_\:\&]{1,100}$/,
    description: /^[\s\S]{0,2000}$/,
    communitySlug: /^[a-z0-9-]{1,55}$/,
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { courseId } = await params;
    const communitySlug = req.nextUrl.searchParams.get('communitySlug')
    if (!communitySlug) return NextResponse.json({ error: "communitySlug is required" }, { status: 400 })

    try {
        const course = await prisma.course.findFirst({
            where: {
                id: courseId,
                community: { slug: communitySlug }
            }
        })

        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

        return NextResponse.json({ course })
    } catch (error) {
        console.error("[COURSE_GET]", error)
        return NextResponse.json({ error: "Failed to fetch course" }, { status: 500 })
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { courseId } = await params
    const body = await req.json()
    const { title, description, communitySlug, isActive, imageUrl, instructorId } = body

    if (!title || !communitySlug) {
        return NextResponse.json({ error: "title and communitySlug are required" }, { status: 400 })
    }

    const checks = [
        { value: title, pattern: PATTERNS.title, field: "title" },
        { value: communitySlug, pattern: PATTERNS.communitySlug, field: "communitySlug" },
        ...(description ? [{ value: description, pattern: PATTERNS.description, field: "description" }] : [])
    ]

    for (const { value, pattern, field } of checks) {
        const error = validateWithRegex(value, pattern, field)
        if (error) return error
    }

    try {
        const course = await prisma.course.update({
            where: {
                id: courseId,
                community: { slug: communitySlug }
            },
            data: {
                title,
                description,
                imageUrl,
                isActive: isActive ?? false,
                ...(instructorId ? {
                    instructor: { connect: { userId: instructorId } }
                } : {
                    instructor: { disconnect: true }  // 👈 clears instructor if removed
                })
            }
        })

        return NextResponse.json({ course })
    } catch (error) {
        console.error("[COURSE_UPDATE]", error)
        return NextResponse.json({ error: "Failed to update course" }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { courseId } = await params

    try {
        await prisma.course.update({
            where: { id: courseId },
            data: { deletedAt: new Date(), isActive: false },
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("[COURSE_DELETE]", error)
        return NextResponse.json({ error: "Failed to delete course" }, { status: 500 })
    }
}