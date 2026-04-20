"use client"

import CourseEnrollButton from "@/components/custom/buttons/CourseEnrollButton";
import EnrollingBadge from "@/components/custom/badge/EnrollingBadge";
import SaveButton from "@/components/custom/buttons/SaveButton";
import PriceBadge from "@/components/custom/badge/PriceBadge";
import { CourseWithInstructorAndCount } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
    course: CourseWithInstructorAndCount
    isEnrolled?: boolean
    communitySlug: string
}

export default function CourseBanner({ course, isEnrolled: initialEnrolled = false, communitySlug }: Props) {
    const [enrolled, setEnrolled] = useState(initialEnrolled)

    return (
        <div className="w-full h-full flex gap-5 items-center justify-between gap-auto rounded-t-[20px] overflow-clip border-border border-b border-0">
            <div className="flex flex-col pl-16 py-5 gap-5">
                <div className="flex items-center gap-3 flex-wrap">
                    <PriceBadge
                        currency="USD"
                        price={course.price}
                        isAbsolute={false}
                    />

                    {course.isActive && (
                        <EnrollingBadge />
                    )}
                </div>

                <h1 className={cn(
                    "font-heading font-semibold text-white leading-tight",
                    course.title.length > 45 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"
                )}>
                    {course.title}
                </h1>

                {course.description && (
                    <p className="text-sm text-white/55 leading-relaxed line-clamp-2 max-w-sm">
                        {course.description}
                    </p>
                )}

                <div className="flex items-center gap-4 pt-1 w-7/8">
                    {enrolled ? (
                        <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
                            <CheckCircle2 className="size-4" />
                            You're enrolled
                        </div>
                    ) : (
                        <>
                            <CourseEnrollButton
                                communitySlug={communitySlug}
                                courseId={course.id}
                                isFree={course.price === 0 || !course.price}
                                setEnrolled={setEnrolled}
                            />

                            <SaveButton isSession={false} />
                        </>
                    )}
                </div>
            </div>

            {course.imageUrl && (
                <div className="relative w-2/3 h-full max-h-100 overflow-clip">
                    <Image
                        src={course.imageUrl || '/placeholder-featured.png'}
                        alt={course.title}
                        width={1200}
                        height={800}
                        preload
                        className="w-full h-full object-cover"
                    />

                    <div className="absolute left-0 -top-1/2 bg-radial from-transparent via-background via-70% to-background w-[150%] h-[200%]" />
                </div>
            )}
        </div>
    )
}