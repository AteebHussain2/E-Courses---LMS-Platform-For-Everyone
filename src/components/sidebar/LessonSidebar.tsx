"use client"

import { ChevronDown, CheckCircle2, Circle, Radio, Video, Lock, BookOpen, X, PanelLeftClose, PanelLeft } from "lucide-react";
import { ModuleWithLessons, CourseWithInstructorAndCount } from "@/lib/types";
import { LessonStatus, LessonType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

type Props = {
    modules: ModuleWithLessons[]
    course: CourseWithInstructorAndCount
    communitySlug: string
}

export default function LessonSidebar({ modules, course, communitySlug }: Props) {
    const pathname = usePathname()
    const [collapsed, setCollapsed] = useState(false)

    // Extract active lessonId from path: /course/[courseId]/lesson/[lessonId]
    const activeLessonId = pathname.split('/lesson/')[1]?.split('/')[0] ?? ''

    // Find which module contains the active lesson
    const activeModuleId = modules.find(m =>
        m.lessons.some(l => l.id === activeLessonId)
    )?.id ?? modules[0]?.id ?? ''

    // Track open module — starts with the one containing active lesson
    const [openModuleId, setOpenModuleId] = useState(activeModuleId)

    // If user navigates to a lesson in a different module, open that module
    useEffect(() => {
        const newActiveModule = modules.find(m =>
            m.lessons.some(l => l.id === activeLessonId)
        )?.id
        if (newActiveModule) setOpenModuleId(newActiveModule)
    }, [activeLessonId, modules])

    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)
    const publishedLessons = modules.reduce(
        (acc, m) => acc + m.lessons.filter(l => l.status === LessonStatus.PUBLISHED).length, 0
    )

    return (
        <aside className={cn(
            "flex flex-col border-r border-border bg-sidebar transition-[width] duration-200 ease-in-out overflow-hidden shrink-0",
            collapsed ? "w-0 border-0" : "w-72 xl:w-80"
        )}>
            {/* Course header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border shrink-0">
                {course.imageUrl && (
                    <Image
                        src={course.imageUrl}
                        alt={course.title}
                        width={40}
                        height={40}
                        className="rounded-md size-10 object-cover shrink-0"
                    />
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate leading-snug">
                        {course.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {publishedLessons} / {totalLessons} lessons
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setCollapsed(true)}
                    className="shrink-0 cursor-pointer"
                >
                    <PanelLeftClose className="size-4" />
                </Button>
            </div>

            {/* Module list */}
            <div className="flex-1 overflow-y-auto py-2 no-scrollbar">
                {modules.map((module, moduleIndex) => (
                    <ModuleRow
                        key={module.id}
                        module={module}
                        moduleIndex={moduleIndex}
                        isOpen={openModuleId === module.id}
                        onToggle={() => setOpenModuleId(prev =>
                            prev === module.id ? '' : module.id
                        )}
                        activeLessonId={activeLessonId}
                        communitySlug={communitySlug}
                        courseId={course.id}
                    />
                ))}
            </div>

            {/* Back to course */}
            <div className="px-4 py-3 border-t border-border shrink-0">
                <Link
                    href={`/${communitySlug}/course/${course.id}`}
                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                    <BookOpen className="size-3.5" />
                    Back to course
                </Link>
            </div>
        </aside>
    )
}

// ─── Collapsed toggle button — floats when sidebar is hidden ─────────────────

export function SidebarToggle({ onOpen }: { onOpen: () => void }) {
    return (
        <Button
            variant="outline"
            size="icon-sm"
            onClick={onOpen}
            className="cursor-pointer border-border bg-input"
        >
            <PanelLeft className="size-4" />
        </Button>
    )
}

// ─── Module row ───────────────────────────────────────────────────────────────

function ModuleRow({
    module,
    moduleIndex,
    isOpen,
    onToggle,
    activeLessonId,
    communitySlug,
    courseId,
}: {
    module: ModuleWithLessons
    moduleIndex: number
    isOpen: boolean
    onToggle: () => void
    activeLessonId: string
    communitySlug: string
    courseId: string
}) {
    const completedCount = 0  // TODO: wire up LessonCompletion once progress tracking is added
    const hasActiveLesson = module.lessons.some(l => l.id === activeLessonId)

    return (
        <div>
            {/* Module header */}
            <button
                type="button"
                onClick={onToggle}
                className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-sidebar-accent transition-colors",
                    hasActiveLesson && !isOpen && "bg-primary/5"
                )}
            >
                <span className={cn(
                    "shrink-0 size-5 rounded-full text-[10px] font-mono font-semibold flex items-center justify-center",
                    hasActiveLesson
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                )}>
                    {String(moduleIndex + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                        {module.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                        {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <ChevronDown className={cn(
                    "size-3.5 text-muted-foreground shrink-0 transition-transform duration-150",
                    isOpen && "rotate-180"
                )} />
            </button>

            {/* Lessons */}
            {isOpen && (
                <div className="pb-1">
                    {module.lessons.map((lesson, lessonIndex) => (
                        <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            lessonIndex={lessonIndex}
                            isActive={lesson.id === activeLessonId}
                            communitySlug={communitySlug}
                            courseId={courseId}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Lesson row ───────────────────────────────────────────────────────────────

function LessonRow({
    lesson,
    lessonIndex,
    isActive,
    communitySlug,
    courseId,
}: {
    lesson: ModuleWithLessons['lessons'][number]
    lessonIndex: number
    isActive: boolean
    communitySlug: string
    courseId: string
}) {
    const isPublished = lesson.status === LessonStatus.PUBLISHED
    const isVideo = lesson.type === LessonType.VIDEO

    const inner = (
        <div className={cn(
            "flex items-center gap-3 pl-8 pr-4 py-2.5 transition-colors",
            isActive
                ? "bg-primary/10 border-l-2 border-primary"
                : "border-l-2 border-transparent hover:bg-sidebar-accent",
            !isPublished && "opacity-50 cursor-not-allowed"
        )}>
            {/* Type / status icon */}
            <div className={cn(
                "size-6 rounded-md shrink-0 flex items-center justify-center",
                isActive
                    ? "bg-primary/20"
                    : isVideo ? "bg-primary/10" : "bg-instructor-bg"
            )}>
                {!isPublished
                    ? <Lock className="size-3 text-muted-foreground" />
                    : isVideo
                        ? <Video className={cn("size-3", isActive ? "text-primary" : "text-primary/70")} />
                        : <Radio className={cn("size-3", isActive ? "text-instructor-fg" : "text-instructor-fg/70")} />
                }
            </div>

            {/* Title */}
            <p className={cn(
                "text-xs truncate flex-1 leading-snug",
                isActive ? "text-primary font-medium" : "text-foreground/80"
            )}>
                {lesson.title}
            </p>

            {/* Index */}
            <span className="text-[10px] font-mono text-muted-foreground/40 shrink-0 tabular-nums">
                {String(lessonIndex + 1).padStart(2, '0')}
            </span>
        </div>
    )

    if (!isPublished) return inner

    return (
        <Link href={`/${communitySlug}/course/${courseId}/lesson/${lesson.id}`}>
            {inner}
        </Link>
    )
}