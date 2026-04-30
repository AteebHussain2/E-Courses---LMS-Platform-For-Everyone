"use client"

import { getResumeLessonAction } from "@/actions/enrollments";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Loader2, PlayCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
    communitySlug: string
    courseId: string
    className?: string
}

export default function ContinueButton({ communitySlug, courseId, className }: Props) {
    const { user } = useUser()

    const { data, isLoading } = useQuery({
        queryKey: ['resume', courseId, user?.id],
        queryFn: () => getResumeLessonAction(user!.id, courseId),
        enabled: !!user,
        staleTime: 1000 * 30, // 30s — matches API revalidate
    })

    const href = data?.lesson
        ? `/${communitySlug}/course/${courseId}/lesson/${data.lesson.id}`
        : `/${communitySlug}/course/${courseId}`

    const isResume = data?.source === 'progress'

    if (isLoading) {
        return (
            <Button
                disabled
                className={cn(
                    "flex-1 h-10 rounded-full font-semibold text-sm cursor-not-allowed text-foreground",
                    className
                )}
            >
                <Loader2 className="size-3.5 animate-spin" />
                Loading...
            </Button>
        )
    }

    return (
        <Button
            asChild
            className={cn(
                "flex-1 h-10 rounded-full font-semibold text-sm hover:scale-105 active:scale-95 transition-transform cursor-pointer text-foreground",
                className
            )}
        >
            <Link href={href}>
                {isResume
                    ? <><PlayCircle className="size-3.5" /> Continue Learning</>
                    : <><BookOpen className="size-3.5" /> Start Course</>
                }
            </Link>
        </Button>
    )
}