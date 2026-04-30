import { BookOpen, Clock, Radio, Video } from "lucide-react";
import LessonPlayer from "@/components/learn/LessonPlayer";
import { LessonType } from "@/generated/prisma/enums";
import { getLessonAction } from "@/actions/lessons";
import { notFound } from "next/navigation";
import { cn } from "@/lib/utils";

type Props = {
    params: Promise<{
        communitySlug: string
        courseId: string
        lessonId: string
    }>
}

export default async function LessonPage({ params }: Props) {
    const { communitySlug, courseId, lessonId } = await params

    const lesson = await getLessonAction(lessonId).catch(() => null)
    if (!lesson || lesson.status === 'DRAFT') return notFound()

    const isVideo = lesson.type === LessonType.VIDEO

    return (
        <div className="max-w-4xl mx-auto px-6 py-7 space-y-7">
            {/* Lesson type chip + title */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full",
                        isVideo
                            ? "bg-primary/10 text-primary"
                            : "bg-instructor-bg text-instructor-fg"
                    )}>
                        {isVideo
                            ? <Video className="size-3" />
                            : <Radio className="size-3" />
                        }
                        {isVideo ? "Video Lesson" : "Live Session"}
                    </span>
                </div>

                <h1 className="text-2xl font-semibold text-foreground font-heading leading-snug">
                    {lesson.title}
                </h1>
            </div>

            {/* Main content */}
            {lesson?.video ? (
                <LessonPlayer
                    lessonId={lesson.id}
                    lessonTitle={lesson.title}
                    courseId={courseId}
                    video={lesson.video}
                />
            ) : (
                <div className="w-full aspect-video bg-muted/30 rounded-xl flex flex-col items-center justify-center gap-3 border border-dashed border-border">
                    <Video className="size-10 text-muted/40" strokeWidth={1} />
                    <p className="text-sm text-muted-foreground">Video not available yet</p>
                </div>
            )}
        </div>
    )
}