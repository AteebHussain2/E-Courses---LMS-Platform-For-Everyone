import { verifyApiRequest, generateSlug } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { LessonType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    const authError = verifyApiRequest(req)
    if (authError) return authError

    const { title, type, moduleId, courseId, communitySlug } = await req.json()

    if (!title || !type || !moduleId || !courseId || !communitySlug) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!Object.values(LessonType).includes(type)) {
        return NextResponse.json({ error: "Invalid lesson type" }, { status: 400 })
    }

    try {
        // verify module belongs to course and community
        const module = await prisma.module.findFirst({
            where: {
                id: moduleId,
                courseId,
                course: { community: { slug: communitySlug } },
                deletedAt: null
            },
            select: { id: true }
        })

        if (!module) return NextResponse.json({ error: "Module not found" }, { status: 404 })

        // get current max index within this module
        const lastLesson = await prisma.lesson.findFirst({
            where: { moduleId },
            orderBy: { index: 'desc' },
            select: { index: true }
        })

        const index = (lastLesson?.index ?? 0) + 1
        const slug = generateSlug(title)

        const lesson = await prisma.lesson.create({
            data: {
                title,
                slug,
                index,
                type: type as LessonType,
                module: { connect: { id: moduleId } }
            }
        })

        return NextResponse.json({ lesson }, { status: 201 })
    } catch (error) {
        console.error("[LESSON_CREATE]", error)
        return NextResponse.json({ error: "Failed to create lesson" }, { status: 500 })
    }
}