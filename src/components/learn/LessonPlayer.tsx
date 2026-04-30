"use client"

import VideoProgressTracker from "@/components/learn/VideoProgressTracker";
import LessonCompleteButton from "@/components/learn/LessonCompleteButton";
import { useProgress } from "@/hooks/use-progress";
import { Video } from "@/generated/prisma/browser";
import { BookOpen, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
    lessonId: string
    lessonTitle: string
    courseId: string
    video: Video
}

export default function LessonPlayer({ lessonId, lessonTitle, courseId, video }: Props) {
    const { updateProgress, toggleComplete, getLessonProgress } = useProgress(courseId)
    const { percent, isComplete } = getLessonProgress(lessonId)

    return (
        <div className="space-y-5">
            {/* Player */}
            {video.videoUrl ? (
                <VideoProgressTracker
                    videoUrl={video.videoUrl}
                    title={lessonTitle}
                    thumbnailUrl={video.imageUrl}
                    lessonId={lessonId}
                    videoId={video.id}
                    onProgress={updateProgress}
                />
            ) : (
                <div className="w-full aspect-video bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">Video not available yet</p>
                </div>
            )}

            {/* Progress bar */}
            {percent > 0 && (
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{percent}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-500",
                                percent >= 90 ? "bg-green-500" : "bg-primary"
                            )}
                            style={{ width: `${percent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Actions row */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                    {video.duration && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {video.duration} min
                        </span>
                    )}
                </div>

                <LessonCompleteButton
                    lessonId={lessonId}
                    isComplete={isComplete}
                    onToggle={toggleComplete}
                />
            </div>

            {/* Description */}
            {video.description && (
                <div className="space-y-2 pt-2 border-t border-border">
                    <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <BookOpen className="size-3.5" />
                        About this lesson
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {video.description}
                    </p>
                </div>
            )}
        </div>
    )
}