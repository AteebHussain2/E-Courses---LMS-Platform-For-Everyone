"use client"

import { ChevronDown, Layers, Lock, Radio, Video } from "lucide-react";
import { LessonStatus, LessonType } from "@/generated/prisma/enums";
import { ModuleWithLessons, LessonInModule } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
    modules: ModuleWithLessons[]
    isEnrolled: boolean
    communitySlug: string
}

export default function CourseModuleList({ modules, isEnrolled, communitySlug }: Props) {
    const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground font-heading">
                    Course Content
                </h2>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Layers className="size-3.5" />
                        {modules.length} modules
                    </span>
                    <span className="flex items-center gap-1">
                        <Video className="size-3.5" />
                        {totalLessons} lessons
                    </span>
                </div>
            </div>

            {/* Modules */}
            <div className="space-y-2">
                {modules.map((module, index) => (
                    <ModuleAccordion
                        key={module.id}
                        module={module}
                        index={index}
                        isEnrolled={isEnrolled}
                        communitySlug={communitySlug}
                        defaultOpen={index === 0}
                    />
                ))}
            </div>
        </div>
    )
}

function ModuleAccordion({
    module,
    index,
    isEnrolled,
    communitySlug,
    defaultOpen
}: {
    module: ModuleWithLessons
    index: number
    isEnrolled: boolean
    communitySlug: string
    defaultOpen: boolean
}) {
    const [open, setOpen] = useState(defaultOpen)
    const publishedCount = module.lessons.filter(l => l.status === LessonStatus.PUBLISHED).length

    return (
        <div className={cn(
            "rounded-xl border border-border/50 overflow-hidden transition-all",
            open && "border-border"
        )}>
            {/* Module header */}
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                className="w-full flex items-center gap-4 px-5 py-4 bg-card hover:bg-card-hover transition-colors text-left"
            >
                {/* Index pill */}
                <span className="shrink-0 size-7 rounded-full bg-primary/10 text-primary text-xs font-mono font-semibold flex items-center justify-center">
                    {String(index + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                        {module.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        {publishedCount} / {module.lessons.length} lessons available
                    </p>
                </div>

                <ChevronDown className={cn(
                    "size-4 text-muted-foreground shrink-0 transition-transform duration-200",
                    open && "rotate-180"
                )} />
            </button>

            {/* Lessons list */}
            {open && module.lessons.length > 0 && (
                <div className="border-t border-border/50 divide-y divide-border/30">
                    {module.lessons.map((lesson, lessonIndex) => (
                        <LessonRow
                            key={lesson.id}
                            lesson={lesson}
                            index={lessonIndex}
                            isEnrolled={isEnrolled}
                            communitySlug={communitySlug}
                        />
                    ))}
                </div>
            )}

            {open && module.lessons.length === 0 && (
                <div className="border-t border-border/50 px-5 py-4 text-xs text-muted-foreground text-center">
                    No lessons added yet
                </div>
            )}
        </div>
    )
}

function LessonRow({
    lesson,
    index,
    isEnrolled,
    communitySlug,
}: {
    lesson: LessonInModule
    index: number
    isEnrolled: boolean
    communitySlug: string
}) {
    const isPublished = lesson.status === LessonStatus.PUBLISHED
    const isVideo = lesson.type === LessonType.VIDEO
    const isLocked = !isEnrolled && !isPublished

    return (
        <div className={cn(
            "flex items-center gap-3.5 px-5 py-3.5 transition-colors",
            isEnrolled && isPublished
                ? "hover:bg-muted/30 cursor-pointer group"
                : "opacity-60 cursor-not-allowed"
        )}>
            {/* Type icon */}
            <div className={cn(
                "size-8 rounded-lg shrink-0 flex items-center justify-center",
                isVideo ? "bg-primary/10" : "bg-instructor-bg"
            )}>
                {isLocked
                    ? <Lock className="size-3.5 text-muted-foreground" />
                    : isVideo
                        ? <Video className="size-3.5 text-primary" />
                        : <Radio className="size-3.5 text-instructor-fg" />
                }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className={cn(
                    "text-sm truncate transition-colors",
                    isEnrolled && isPublished
                        ? "text-foreground group-hover:text-primary"
                        : "text-muted-foreground"
                )}>
                    {lesson.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground capitalize">
                        {lesson.type === LessonType.VIDEO ? "Video" : "Live Session"}
                    </span>
                    {!isPublished && (
                        <span className="text-[10px] bg-yellow-400/10 text-yellow-500 px-1.5 py-0.5 rounded font-medium uppercase tracking-wide">
                            Draft
                        </span>
                    )}
                </div>
            </div>

            {/* Right: lock or lesson number */}
            <span className="text-xs font-mono text-muted-foreground/50 shrink-0 tabular-nums">
                {String(index + 1).padStart(2, '0')}
            </span>
        </div>
    )
}