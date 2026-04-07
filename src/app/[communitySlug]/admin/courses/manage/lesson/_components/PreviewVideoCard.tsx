"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Clock, ExternalLink, Video, Link2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, getUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

type PreviewVideoCardProps = {
    communitySlug: string
    lessonId: string
    lessonTitle: string
    video: {
        imageUrl?: string | null
        videoUrl?: string | null
        description?: string | null
        duration?: number | null
    } | null
}

function getVideoSource(url: string): string {
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube"
    if (url.includes("vimeo.com")) return "Vimeo"
    return "External"
}

export default function PreviewVideoCard({
    communitySlug,
    lessonId,
    lessonTitle,
    video,
}: PreviewVideoCardProps) {
    const lessonUrl = getUrl(`/learn?v=${lessonId}`).toString()
    const isEmpty = !video?.videoUrl && !video?.imageUrl && !video?.description

    return (
        <div className="space-y-2">
            <p className="text-xs font-medium text-muted uppercase tracking-wider">
                Student Preview
            </p>

            <Card className="w-full max-w-sm p-0! pb-3! gap-3! overflow-hidden">
                {/* Thumbnail */}
                <CardHeader className="p-0!">
                    <div className="relative w-full aspect-video bg-muted flex items-center justify-center">
                        {video?.imageUrl ? (
                            <Image
                                src={video.imageUrl}
                                alt={lessonTitle || 'This is a thumbnail for the video lesson'}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <Video className="size-10 text-muted-foreground/30" strokeWidth={1} />
                        )}

                        {/* Duration pill */}
                        {video?.duration && (
                            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded-full">
                                <Clock className="size-3" />
                                {video.duration} min
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="px-4! py-0! space-y-2">
                    {/* Title */}
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                        {lessonTitle}
                    </h4>

                    {/* Video source badge */}
                    {video?.videoUrl ? (
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                            <Link2 className="size-3 shrink-0" />
                            <span>{getVideoSource(video.videoUrl)}</span>
                        </div>
                    ) : (
                        <div className={cn(
                            "text-xs px-2 py-0.5 rounded w-fit",
                            isEmpty
                                ? "bg-muted/50 text-muted-foreground"
                                : "bg-yellow-500/10 text-yellow-500"
                        )}>
                            {isEmpty ? "No content yet" : "No video URL yet"}
                        </div>
                    )}

                    {/* Description */}
                    {video?.description && (
                        <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                            {video.description}
                        </p>
                    )}
                </CardContent>

                <CardFooter className="px-4! pb-0! flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Link
                            href={lessonUrl}
                            className="wrap-break-word w-full text-primary underline"
                        >
                            /{lessonUrl.split('/').slice(3).join('/')}
                        </Link>

                        <Button
                            variant="ghost"
                            className="hover:cursor-pointer"
                            size="icon-sm"
                            type="button"
                            onClick={() => {
                                navigator.clipboard.writeText(lessonUrl)
                                toast.success("Lesson URL copied to clipboard")
                            }}
                        >
                            <Copy />
                        </Button>
                    </div>

                    <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full gap-1.5 border-border bg-input cursor-pointer text-xs"
                    >
                        <Link href={lessonUrl} target="_blank">
                            <ExternalLink className="size-3" />
                            View Lesson Page
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}