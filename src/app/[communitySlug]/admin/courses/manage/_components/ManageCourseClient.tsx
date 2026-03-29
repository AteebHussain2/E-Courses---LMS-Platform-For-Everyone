"use client"

import { ArrowLeft, BookOpen, Users, Layers, Globe2, GlobeX, ArrowRight, Edit2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CourseWithInstructorAndCount } from "@/lib/types";
import { getModulesAction } from "@/actions/modules";
import CreateModuleDialog from "./CreateModuleDialog";
import CustomBadge from "@/components/CustomBadge";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import ModuleList from "./ModuleList";
import Image from "next/image";
import Link from "next/link";

type Props = {
    course: CourseWithInstructorAndCount
    communitySlug: string
}

export default function ManageCourseClient({ course, communitySlug }: Props) {
    const router = useRouter()

    const { data: modules = [], isLoading } = useQuery({
        queryKey: ['modules', course.id],
        queryFn: () => getModulesAction(course.id, communitySlug),
        staleTime: 1000 * 60 * 60 * 5,
    })

    return (
        <div className="space-y-5">
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer rounded-full"
                    onClick={() => router.push(`/${communitySlug}/admin/courses`)}
                >
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-xl font-semibold text-foreground truncate">
                            {course.title}
                        </h1>
                        <CustomBadge
                            text={course.isActive ? 'Public' : 'Private'}
                            icon={course.isActive ? Globe2 : GlobeX}
                        />
                    </div>
                    <p className="text-muted text-sm mt-0.5">
                        Manage modules and lessons
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                    {course.imageUrl && (
                        <div className="rounded-xl overflow-hidden border border-border aspect-video w-full">
                            <Image
                                src={course.imageUrl}
                                alt={course.title}
                                width={400}
                                height={225}
                                className="object-cover size-full"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-border bg-input p-4 space-y-1">
                            <div className="flex items-center gap-2 text-muted">
                                <Layers className="size-3.5" />
                                <span className="text-xs">Modules</span>
                            </div>
                            <p className="text-2xl font-semibold text-foreground">
                                {modules.length}
                            </p>
                        </div>
                        <div className="rounded-xl border border-border bg-input p-4 space-y-1 group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted">
                                    <Users className="size-3.5" />
                                    <span className="text-xs">Enrolled</span>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={`/${communitySlug}/admin/courses/students?courseId=${course.id}`}
                                            className="p-0 text-xs mt-0.5 text-muted hover:text-primary"
                                        >
                                            <ArrowRight className="size-4 group-hover:-rotate-45 transition-all group-hover:scale-110 scale-0" />
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        View enrolled students
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <p className="text-2xl font-semibold text-foreground">
                                {course._count.enrollments}
                            </p>
                        </div>
                    </div>

                    {course.instructor && (
                        <div className="rounded-xl border border-border bg-input p-4 flex items-center gap-3">
                            {course.instructor.avatar && (
                                <Image
                                    src={course.instructor.avatar}
                                    alt={course.instructor.firstName}
                                    width={36}
                                    height={36}
                                    className="rounded-full size-9 object-cover"
                                />
                            )}
                            <div>
                                <p className="text-xs text-muted">Instructor</p>
                                <p className="text-sm font-medium text-foreground">
                                    {course.instructor.firstName} {course.instructor.lastName}
                                </p>
                            </div>
                        </div>
                    )}

                    {course.description && (
                        <div className="rounded-xl border border-border bg-input p-4">
                            <div className="flex items-center gap-2 text-muted mb-2">
                                <BookOpen className="size-3.5" />
                                <span className="text-xs">Description</span>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed line-clamp-4">
                                {course.description}
                            </p>
                        </div>
                    )}

                    <Button asChild variant="outline" className="w-full">
                        <Link href={`/${communitySlug}/courses/edit?courseId=${course.id}`}>
                            <Edit2 className="size-3.5 mr-1" />
                            Edit Course
                        </Link>
                    </Button>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-medium text-muted uppercase tracking-wider">
                            Modules — {modules.length}
                        </h2>
                        <CreateModuleDialog courseId={course.id} communitySlug={communitySlug} />
                    </div>

                    <ModuleList
                        modules={modules}
                        isLoading={isLoading}
                        courseId={course.id}
                        communitySlug={communitySlug}
                    />
                </div>
            </div>
        </div>
    )
}