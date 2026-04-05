import { NextRequest, NextResponse } from "next/server";
import { verifyApiRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const CUTOFF_HOURS = 48;

// ─── ImageKit helpers (no extra dependency needed — uses REST API directly) ───

function imagekitAuthHeader() {
    // ImageKit basic auth: base64(privateKey + ":")
    const encoded = Buffer.from(`${process.env.IMAGEKIT_PRIVATE_KEY}:`).toString("base64");
    return `Basic ${encoded}`;
}

function extractImageKitPath(imageUrl: string): string | null {
    const endpoint = process.env.IMAGEKIT_URL_ENDPOINT;
    if (!endpoint || !imageUrl.startsWith(endpoint)) return null;
    // e.g. "https://ik.imagekit.io/abc/courses/hero.jpg" → "/courses/hero.jpg"
    return imageUrl.slice(endpoint.length) || null;
}

async function deleteFromImageKit(imageUrl: string): Promise<void> {
    const filePath = extractImageKitPath(imageUrl);
    if (!filePath) throw new Error(`URL not from this ImageKit account: ${imageUrl}`);

    const auth = imagekitAuthHeader();

    // Step 1: find the fileId by path
    const searchRes = await fetch(
        `https://api.imagekit.io/v1/files?searchQuery=filePath="${filePath}"`,
        { headers: { Authorization: auth } }
    );
    if (!searchRes.ok) throw new Error(`ImageKit search failed: ${searchRes.status}`);

    const files: Array<{ fileId: string }> = await searchRes.json();
    if (files.length === 0) return; // already gone — that's fine

    // Step 2: delete by fileId
    const deleteRes = await fetch(
        `https://api.imagekit.io/v1/files/${files[0].fileId}`,
        { method: "DELETE", headers: { Authorization: auth } }
    );
    if (!deleteRes.ok) throw new Error(`ImageKit delete failed: ${deleteRes.status}`);
}

// ─── B2 helper ───────────────────────────────────────────────────────────────

async function deleteFromB2(_fileKey: string): Promise<void> {
    // TODO: implement when B2 upload is live.
    // You'll need: B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_ID
    //
    // Flow:
    //   1. POST https://api.backblazeb2.com/b2api/v3/b2_authorize_account  → authToken + apiUrl
    //   2. POST {apiUrl}/b2api/v3/b2_delete_file_version                    → { fileId, fileName: fileKey }
    //
    // B2 deleteFileVersion requires the fileId (not just the key). Store it at upload time.
    // For now this is a no-op — files with fileKey stay in B2 until this is wired up.
    console.warn(`[CLEANUP] B2 deletion not yet implemented. fileKey=${_fileKey}`);
}

// ─── Dry-run (GET) ────────────────────────────────────────────────────────────

// GET /api/cleanup — preview what would be deleted without touching anything
export async function GET(req: NextRequest) {
    const authError = verifyApiRequest(req);
    if (authError) return authError;

    const cutoff = new Date(Date.now() - CUTOFF_HOURS * 60 * 60 * 1000);

    const [courses, sessions, modules, lessons] = await Promise.all([
        prisma.course.findMany({
            where: { deletedAt: { not: null, lte: cutoff } },
            select: {
                id: true,
                title: true,
                deletedAt: true,
                imageUrl: true,
                modules: {
                    select: {
                        id: true,
                        lessons: {
                            select: {
                                id: true,
                                video: { select: { fileKey: true } },
                            },
                        },
                    },
                },
            },
        }),

        prisma.session.findMany({
            where: { deletedAt: { not: null, lte: cutoff } },
            select: {
                id: true,
                title: true,
                deletedAt: true,
                recording: { select: { fileKey: true } },
            },
        }),

        // Orphaned modules (course is still active but module was individually soft-deleted)
        prisma.module.findMany({
            where: {
                deletedAt: { not: null, lte: cutoff },
                course: { deletedAt: null },           // course is alive
            },
            select: { id: true, title: true, deletedAt: true },
        }),

        // Orphaned lessons (module is still active but lesson was individually soft-deleted)
        prisma.lesson.findMany({
            where: {
                deletedAt: { not: null, lte: cutoff },
                module: {
                    deletedAt: null,            // module is alive
                    course: { deletedAt: null },
                },
            },
            select: { id: true, title: true, deletedAt: true, video: { select: { fileKey: true } } },
        }),
    ]);

    const b2FilesToDelete = [
        ...courses.flatMap(c =>
            c.modules.flatMap(m =>
                m.lessons.flatMap(l => (l.video?.fileKey ? [l.video.fileKey] : []))
            )
        ),
        ...sessions.flatMap(s => (s.recording?.fileKey ? [s.recording.fileKey] : [])),
        ...lessons.flatMap(l => (l.video?.fileKey ? [l.video.fileKey] : [])),
    ];

    const imagekitUrlsToDelete = courses
        .map(c => c.imageUrl)
        .filter((url): url is string => !!url);

    return NextResponse.json({
        cutoff,
        willDelete: {
            courses: courses.length,
            sessions: sessions.length,
            orphanedModules: modules.length,
            orphanedLessons: lessons.length,
            b2Files: b2FilesToDelete.length,
            imagekitImages: imagekitUrlsToDelete.length,
        },
        preview: {
            courses: courses.map(c => ({ id: c.id, title: c.title, deletedAt: c.deletedAt })),
            sessions: sessions.map(s => ({ id: s.id, title: s.title, deletedAt: s.deletedAt })),
            orphanedModules: modules,
            orphanedLessons: lessons,
        },
    });
}

// ─── Actual cleanup (DELETE) ──────────────────────────────────────────────────

// DELETE /api/cleanup — hard-delete everything soft-deleted more than 48h ago
export async function DELETE(req: NextRequest) {
    const authError = verifyApiRequest(req);
    if (authError) return authError;

    const cutoff = new Date(Date.now() - CUTOFF_HOURS * 60 * 60 * 1000);

    const storageErrors: string[] = [];
    const storageDeleted = { imagekitImages: 0, b2Files: 0 };

    // ── Step 1: Collect all media BEFORE touching the DB ──────────────────────
    // (cascade deletes would wipe the records before we can read their fileKeys)

    const [
        softDeletedCourses,
        softDeletedSessions,
        orphanedVideos,     // from individually deleted lessons whose module/course is alive
    ] = await Promise.all([
        prisma.course.findMany({
            where: { deletedAt: { not: null, lte: cutoff } },
            select: {
                id: true,
                imageUrl: true,
                modules: {
                    select: {
                        lessons: {
                            select: {
                                video: { select: { id: true, fileKey: true } },
                            },
                        },
                    },
                },
            },
        }),

        prisma.session.findMany({
            where: { deletedAt: { not: null, lte: cutoff } },
            select: { id: true, recording: { select: { fileKey: true } } },
        }),

        // Videos under individually soft-deleted lessons (parent module/course is alive)
        prisma.video.findMany({
            where: {
                deletedAt: { not: null, lte: cutoff },
                lesson: {
                    deletedAt: { not: null, lte: cutoff },
                    module: { deletedAt: null },  // module still active → no course cascade
                },
            },
            select: { fileKey: true },
        }),
    ]);

    // ── Step 2: Delete media from storage (best-effort — never blocks DB cleanup) ──

    // Course images → ImageKit
    for (const course of softDeletedCourses) {
        if (!course.imageUrl) continue;
        try {
            await deleteFromImageKit(course.imageUrl);
            storageDeleted.imagekitImages++;
        } catch (e) {
            storageErrors.push(`imagekit course=${course.id}: ${String(e)}`);
        }
    }

    // Video files from courses → B2
    const courseVideoKeys = softDeletedCourses.flatMap(c =>
        c.modules.flatMap(m =>
            m.lessons.flatMap(l => (l.video?.fileKey ? [l.video.fileKey] : []))
        )
    );

    // Video files from individually deleted lessons → B2
    const orphanVideoKeys = orphanedVideos
        .map(v => v.fileKey)
        .filter((k): k is string => !!k);

    // Recording files from sessions → B2
    const recordingKeys = softDeletedSessions
        .map(s => s.recording?.fileKey)
        .filter((k): k is string => !!k);

    for (const key of [...courseVideoKeys, ...orphanVideoKeys, ...recordingKeys]) {
        try {
            await deleteFromB2(key);
            storageDeleted.b2Files++;
        } catch (e) {
            storageErrors.push(`b2 key=${key}: ${String(e)}`);
        }
    }

    // ── Step 3: Hard-delete from DB ───────────────────────────────────────────
    // Order matters: Sessions before Courses so their Recordings are gone before
    // any shared WatchProgress rows get ambiguously referenced.

    // Sessions → cascade: Recording, WatchProgress (on Recording)
    const deletedSessions = await prisma.session.deleteMany({
        where: { deletedAt: { not: null, lte: cutoff } },
    });

    // Courses → cascade: Module → Lesson → Video, LessonCompletion, WatchProgress (on Video)
    // Also cascades Enrollment
    const deletedCourses = await prisma.course.deleteMany({
        where: { deletedAt: { not: null, lte: cutoff } },
    });

    // Orphaned modules (their course is still alive — not caught by course cascade)
    // cascade: Lesson → Video, LessonCompletion, WatchProgress (on Video)
    const deletedModules = await prisma.module.deleteMany({
        where: {
            deletedAt: { not: null, lte: cutoff },
            course: { deletedAt: null },
        },
    });

    // Orphaned lessons (their module is still alive — not caught by module cascade)
    // cascade: Video, LessonCompletion, WatchProgress (on Video)
    const deletedLessons = await prisma.lesson.deleteMany({
        where: {
            deletedAt: { not: null, lte: cutoff },
            module: { deletedAt: null },
        },
    });

    // ── Step 4: Return summary ────────────────────────────────────────────────

    return NextResponse.json({
        success: true,
        cutoff,
        storage: {
            deleted: storageDeleted,
            errors: storageErrors,  // non-fatal — logged but didn't abort
        },
        db: {
            courses: deletedCourses.count,    // + cascaded modules, lessons, videos, enrollments
            sessions: deletedSessions.count,  // + cascaded recordings, watchProgress
            orphanedModules: deletedModules.count,
            orphanedLessons: deletedLessons.count,
        },
    });
}