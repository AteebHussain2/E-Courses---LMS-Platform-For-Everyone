import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { bustCache } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { userId, courseId, communitySlug } = await req.json()

    if (!userId || !courseId || !communitySlug) {
        return NextResponse.json({ error: "userId, courseId and communitySlug are required" }, { status: 400 })
    }

    try {
        // Verify course is active and belongs to this community
        const course = await prisma.course.findFirst({
            where: { id: courseId, community: { slug: communitySlug }, isActive: true, deletedAt: null },
            select: { id: true, price: true }
        })
        if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

        // Check already enrolled
        const existing = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } }
        })
        if (existing) return NextResponse.json({ error: "Already enrolled" }, { status: 409 })

        const enrollment = await prisma.enrollment.create({
            data: { userId, courseId }
        })

        await bustCache(['courses', `courses:${communitySlug}`])

        return NextResponse.json({ enrollment }, { status: 201 })
    } catch (error) {
        console.error("[ENROLL]", error)
        return NextResponse.json({ error: "Failed to enroll" }, { status: 500 })
    }
}

export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { searchParams } = req.nextUrl
    const userId = searchParams.get('userId')
    const courseId = searchParams.get('courseId')

    if (!userId || !courseId) {
        return NextResponse.json({ error: "userId and courseId are required" }, { status: 400 })
    }

    try {
        const enrollment = await prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId } },
            select: { id: true, enrolledAt: true, completedAt: true }
        })
        return NextResponse.json({ enrollment })
    } catch (error) {
        return NextResponse.json({ error: "Failed to check enrollment" }, { status: 500 })
    }
}