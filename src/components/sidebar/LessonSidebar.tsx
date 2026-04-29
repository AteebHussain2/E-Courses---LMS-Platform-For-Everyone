"use client"

import { ChevronDown, CheckCircle2, Circle, Radio, Video, Lock, BookOpen, X, PanelLeftClose, PanelLeft, ArrowLeft } from "lucide-react";
import { ModuleWithLessons, CourseWithInstructorAndCount } from "@/lib/types";
import { LessonStatus, LessonType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import { SidebarUserItem } from "./SidebarItem";
import { Progress } from "../ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

type Props = {
    modules: ModuleWithLessons[]
    course: CourseWithInstructorAndCount
    communitySlug: string
}

export default function LessonSidebar({ modules, course, communitySlug }: Props) {
    const pathname = usePathname()

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
        <Sidebar collapsible="icon" className="border-none! pt-6! gap-4.5 font-heading">
            <SidebarHeader className="flex! flex-row! items-center gap-0! px-4.5!">
                {course.imageUrl && <Image
                    width={40}
                    height={40}
                    alt={course.title}
                    src={course.imageUrl}
                    className="mr-3 rounded-sm aspect-square object-cover"
                />}
                <div className="flex items-start flex-col">
                    <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                        {course.title}
                    </p>
                    <p className="text-xs text-secondary line-clamp-2 leading-snug">
                        {totalLessons} lesson{totalLessons !== 1 ? 's' : ''}
                    </p>
                </div>
            </SidebarHeader>

            <SidebarMenu>
                <SidebarMenuItem className="py-4 px-3.5! flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <p className="font-heading text-sm text-secondary font-semibold pb-1">Course Progress</p>
                        <p className="text-xs text-foreground font-medium">
                            {Math.round((publishedLessons / totalLessons) * 100)}% {/*TODO: replace published lessons with completed lessons*/}
                        </p>
                    </div>
                    <Progress value={(publishedLessons / totalLessons) * 100} /> {/*TODO: replace published lessons with completed lessons*/}
                    <p className="text-muted text-xs">Start watching to raise the bar!</p>
                </SidebarMenuItem>
            </SidebarMenu>

            <SidebarMenu className="visible">
                <SidebarMenuItem className="pb-6 pt-2 px-3.5!">
                    <Link
                        href={`/${communitySlug}/courses/${course.slug}`}
                        className="transition-colors flex items-center gap-2 text-secondary font-normal hover:text-foreground cursor-pointer"
                    >
                        <ArrowLeft className="size-4! pt-0.5" />
                        <span className="text-xs">Go back to course</span>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>

            <SidebarContent className="p-0! gap-4.5!">
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
            </SidebarContent>

            <SidebarFooter className="pl-4.5!">
                <SidebarMenu>
                    <SidebarUserItem path={pathname} />
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
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
        <Collapsible open={isOpen} onOpenChange={onToggle} className="group/collapsible px-2!">
            <SidebarGroup
                className={cn(
                    "p-0! flex border-border/40 group-data-[state=open]/collapsible:border-border border rounded-sm overflow-clip",
                )}
            >
                <SidebarGroupLabel
                    asChild
                    className={cn("py-2! px-3! flex-1 h-full hover:bg-sidebar-accent rounded-none transition-all group-data-[state=open]/collapsible:bg-sidebar-accent",
                        hasActiveLesson && "bg-sidebar-accent"
                    )}
                >
                    <CollapsibleTrigger className="gap-4 text-left">
                        <span>
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

                        <p className={cn("text-xs font-medium", completedCount > 0 ? 'text-status-success' : 'text-muted')}>
                            {module.lessons.length !== 0 ? Math.round((completedCount / module.lessons.length) * 100) : '0'}%
                        </p>

                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent
                    className={cn("border-t border-border")}
                >
                    <SidebarGroupContent>
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
                    </SidebarGroupContent>
                </CollapsibleContent>
            </SidebarGroup>
        </Collapsible>
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