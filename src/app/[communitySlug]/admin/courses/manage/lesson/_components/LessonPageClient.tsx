"use client"

import { ArrowLeft, Video, Radio } from "lucide-react";
import { getLessonAction } from "@/actions/lessons";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import SessionForm from "./SessionForm";
import VideoForm from "./VideoForm";
import { cn } from "@/lib/utils";

type Lesson = NonNullable<Awaited<ReturnType<typeof getLessonAction>>>

type Props = {
    lesson: Lesson
    communitySlug: string
}

export default function LessonPageClient({ lesson, communitySlug }: Props) {
    const router = useRouter()
    const isVideo = lesson.type === 'VIDEO'

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer rounded-full shrink-0"
                    onClick={() => router.push(`/${communitySlug}/admin/courses/manage?courseId=${lesson.module.courseId}`)}
                >
                    <ArrowLeft className="size-4" />
                </Button>

                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                        "size-8 rounded-lg flex items-center justify-center shrink-0",
                        isVideo ? "bg-primary/10" : "bg-instructor-bg"
                    )}>
                        {isVideo
                            ? <Video className="size-4 text-primary" />
                            : <Radio className="size-4 text-instructor-fg" />
                        }
                    </div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-semibold text-foreground truncate">
                                {lesson.title}
                            </h1>
                            <span className={cn(
                                "text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0",
                                isVideo
                                    ? "bg-primary/10 text-primary"
                                    : "bg-instructor-bg text-instructor-fg"
                            )}>
                                {isVideo ? "Video" : "Live Session"}
                            </span>
                        </div>
                        <p className="text-sm text-muted mt-0.5">
                            {lesson.module.title}
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            {isVideo ? (
                <VideoForm
                    communitySlug={communitySlug}
                    courseId={lesson.module.courseId}
                    lessonTitle={lesson.title}
                    lessonId={lesson.id}
                    existingVideo={lesson.video}
                />
            ) : (
                <SessionForm
                    lessonId={lesson.id}
                    communitySlug={communitySlug}
                    courseId={lesson.module.courseId}
                    lessonTitle={lesson.title}
                    existingSession={lesson.session}
                />
            )}
        </div>
    )
}