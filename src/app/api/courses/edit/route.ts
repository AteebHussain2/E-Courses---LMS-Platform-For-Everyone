import { verifyApiRequest, generateSlug, validateWithRegex } from "@/lib/api";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const PATTERNS = {
    title: /^[a-zA-Z0-9\s\-\_\:\&]{1,100}$/,
    description: /^[\s\S]{0,2000}$/,
    communitySlug: /^[a-z0-9-]{1,55}$/,
}

export async function POST(req: NextRequest) {
    // verify request is from trusted client
    const authError = verifyApiRequest(req)
    if (authError) return authError

    // parse body
    const body = await req.json()
    const { title, description, communitySlug, isActive, imageUrl, instructorId } = body

    // validate required fields exist
    if (!title || !communitySlug || !instructorId) {
        return NextResponse.json({ error: "title and communitySlug are required" }, { status: 400 })
    }

    // validate with regex
    const checks = [
        validateWithRegex(title, PATTERNS.title, "title"),
        validateWithRegex(communitySlug, PATTERNS.communitySlug, "communitySlug"),
        ...(description ? [validateWithRegex(description, PATTERNS.description, "description")] : []),
    ]

    for (const error of checks) {
        if (error) return error
    }

    // generate slug
    const slug = generateSlug(title)

    // creating course
    try {
        const course = await prisma.course.create({
            data: {
                title,
                slug,
                description,
                imageUrl,
                isActive: isActive ?? false,
                community: {
                    connect: { slug: communitySlug }
                },
                instructor: {
                    connect: { userId: instructorId }
                }
            }
        });

        return NextResponse.json({ course }, { status: 201 })
    } catch (error) {
        console.error("[CREATE_COURSE]", error)
        return NextResponse.json({ error: "Failed to create course" }, { status: 500 })
    }
}