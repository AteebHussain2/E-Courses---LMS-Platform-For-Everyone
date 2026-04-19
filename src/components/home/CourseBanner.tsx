"use client"

import { BookOpen, CheckCircle2, GraduationCap, Layers, Loader2, Users } from "lucide-react";
import { enrollCourseAction } from "@/actions/enrollments";
import { CourseWithInstructorAndCount } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";

type Props = {
    course: CourseWithInstructorAndCount
    communitySlug: string
    isEnrolled?: boolean
    moduleCount: number
}

export default function CourseBanner({ course, communitySlug, isEnrolled: initialEnrolled = false, moduleCount }: Props) {
    const { user } = useUser()
    const [enrolled, setEnrolled] = useState(initialEnrolled)
    const isFree = !course.price || course.price === 0

    const mutation = useMutation({
        mutationFn: () => {
            if (!user) throw new Error("Sign in to enroll")
            return enrollCourseAction(user.id, course.id, communitySlug)
        },
        onSuccess: () => {
            setEnrolled(true)
            toast.success("You're enrolled! Welcome to the course.")
        },
        onError: (e) => toast.error(e.message)
    })

    return (
        <div className="relative w-full overflow-hidden rounded-2xl bg-[#0d0d14] min-h-60 flex items-center">

            {/* Right image */}
            {course.imageUrl && (
                <>
                    <div className="absolute inset-0">
                        <Image
                            src={course.imageUrl}
                            alt={course.title}
                            fill
                            className="object-cover object-right"
                            priority
                        />
                    </div>
                    {/* Layered left-fade gradients */}
                    <div className="absolute inset-0 bg-linear-to-r from-[#0d0d14] via-[#0d0d14]/95 to-[#0d0d14]/20" />
                    <div className="absolute inset-0 bg-linear-to-r from-[#0d0d14] to-transparent" style={{ width: '55%' }} />
                    {/* Bottom scrim */}
                    <div className="absolute bottom-0 inset-x-0 h-16 bg-linear-to-t from-[#0d0d14]/60 to-transparent" />
                </>
            )}

            {/* Content */}
            <div className="relative z-10 px-8 py-10 max-w-[56%] space-y-5">

                {/* Price badge */}
                <div className="flex items-center gap-2.5">
                    <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase",
                        isFree
                            ? "bg-green-500/15 text-green-400 border border-green-500/20"
                            : "bg-primary/15 text-primary border border-primary/20"
                    )}>
                        {isFree ? "Free" : `RS ${course.price?.toLocaleString()}`}
                    </span>

                    {course.isActive && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60 border border-white/10">
                            <span className="relative flex size-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-60" />
                                <span className="relative inline-flex rounded-full size-1.5 bg-green-400" />
                            </span>
                            Enrolling Now
                        </span>
                    )}
                </div>

                {/* Title */}
                <h1 className={cn(
                    "font-heading font-semibold text-white leading-tight",
                    course.title.length > 45 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
                )}>
                    {course.title}
                </h1>

                {/* Description */}
                {course.description && (
                    <p className="text-sm text-white/55 leading-relaxed line-clamp-2 max-w-sm">
                        {course.description}
                    </p>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-4 flex-wrap">
                    {course.instructor && (
                        <div className="flex items-center gap-1.5 text-xs text-white/50">
                            <GraduationCap className="size-3.5 text-primary/70" />
                            <span>{course.instructor.firstName} {course.instructor.lastName}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                        <Layers className="size-3.5" />
                        <span>{moduleCount} modules</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/50">
                        <Users className="size-3.5" />
                        <span>{course._count.enrollments} enrolled</span>
                    </div>
                </div>

                {/* CTA */}
                <div className="flex items-center gap-4 pt-1">
                    {enrolled ? (
                        <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
                            <CheckCircle2 className="size-4" />
                            You're enrolled
                        </div>
                    ) : (
                        <>
                            <Button
                                onClick={() => mutation.mutate()}
                                disabled={mutation.isPending || !user}
                                className="px-6 h-10 rounded-full font-semibold text-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer text-foreground"
                            >
                                {mutation.isPending
                                    ? <><Loader2 className="size-3.5 animate-spin" /> Enrolling...</>
                                    : <><BookOpen className="size-3.5" /> {isFree ? "Enroll Free" : "Enroll Now"}</>
                                }
                            </Button>

                            <button className="text-sm text-white/50 hover:text-white/80 transition-colors">
                                + Save in Library
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}