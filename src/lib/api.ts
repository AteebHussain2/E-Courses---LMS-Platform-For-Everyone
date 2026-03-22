import 'dotenv';
import { NextRequest, NextResponse } from "next/server";

export const apiHeaders = {
    'Content-Type': 'application/json',
    'x-api-secret': process.env.API_SECRET!
}

export function verifyApiRequest(req: NextRequest): NextResponse | null {
    const secret = req.headers.get('x-api-secret')

    if (!secret || secret !== process.env.API_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return null // null means request is trusted, proceed
}

export function generateSlug(title: string): string {
    const base = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')           // spaces to hyphens
        .replace(/-+/g, '-')            // collapse multiple hyphens
        .slice(0, 50)                   // cap base at 50 chars
        .replace(/-$/, '')

    const hex = Math.floor(Math.random() * 0xFFFF)
        .toString(16)
        .padStart(4, '0')

    return `${base}-${hex}`
}

export function validateWithRegex(value: string, pattern: RegExp, field: string): NextResponse | null {
    if (!pattern.test(value)) {
        return NextResponse.json({ error: `Invalid ${field}` }, { status: 400 })
    }
    return null
}