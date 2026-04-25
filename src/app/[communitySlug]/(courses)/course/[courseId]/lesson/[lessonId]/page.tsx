import { BookOpen, Clock, Radio, Video } from "lucide-react";
import SessionView from "@/components/learn/SessionView";
import VideoPlayer from "@/components/learn/VideoPlayer";
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
            {isVideo ? (
                lesson.video?.videoUrl ? (
                    <VideoPlayer
                        videoUrl={lesson.video.videoUrl}
                        title={lesson.title}
                        thumbnailUrl={lesson.video.imageUrl}
                    />
                ) : (
                    <div className="w-full aspect-video bg-muted/30 rounded-xl flex flex-col items-center justify-center gap-3 border border-dashed border-border">
                        <Video className="size-10 text-muted/40" strokeWidth={1} />
                        <p className="text-sm text-muted-foreground">Video not available yet</p>
                    </div>
                )
            ) : (
                lesson.session ? (
                    <SessionView session={{
                        ...lesson.session,
                        recording: null  // TODO: extend getLessonAction to include recording
                    }} />
                ) : (
                    <div className="w-full aspect-video bg-muted/30 rounded-xl flex flex-col items-center justify-center gap-3 border border-dashed border-border">
                        <Radio className="size-10 text-muted/40" strokeWidth={1} />
                        <p className="text-sm text-muted-foreground">Session details not available yet</p>
                    </div>
                )
            )}

            {/* Description */}
            {isVideo && lesson.video?.description && (
                <div className="space-y-2 pt-2 border-t border-border">
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <BookOpen className="size-3.5" />
                        About this lesson
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {lesson.video.description}
                    </p>
                </div>
            )}

            {/* Duration */}
            {isVideo && lesson.video?.duration && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    {lesson.video.duration} min
                </div>
            )}
        </div>
    )
}