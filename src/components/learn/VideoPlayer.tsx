"use client"

import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

type Props = {
    videoUrl: string
    title: string
    thumbnailUrl?: string | null
}

function getEmbedUrl(url: string): string | null {
    try {
        const u = new URL(url)

        // YouTube
        if (u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be')) {
            const id = u.hostname.includes('youtu.be')
                ? u.pathname.slice(1)
                : u.searchParams.get('v')
            if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`
        }

        // Vimeo
        if (u.hostname.includes('vimeo.com')) {
            const id = u.pathname.split('/').filter(Boolean).pop()
            if (id) return `https://player.vimeo.com/video/${id}?autoplay=1&title=0&byline=0`
        }

        return null // direct MP4 or unknown
    } catch {
        return null
    }
}

export default function VideoPlayer({ videoUrl, title, thumbnailUrl }: Props) {
    const [playing, setPlaying] = useState(false)
    const embedUrl = getEmbedUrl(videoUrl)
    const isDirect = !embedUrl // direct MP4

    if (playing && embedUrl) {
        return (
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                <iframe
                    src={embedUrl}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="size-full"
                />
            </div>
        )
    }

    if (playing && isDirect) {
        return (
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
                <video
                    src={videoUrl}
                    controls
                    autoPlay
                    className="size-full"
                    title={title}
                />
            </div>
        )
    }

    // Thumbnail / click-to-play state
    return (
        <div
            className="w-full aspect-video bg-[#0d0d14] rounded-xl overflow-hidden relative group cursor-pointer"
            onClick={() => setPlaying(true)}
        >
            {thumbnailUrl && (
                <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    className="object-cover opacity-70 group-hover:opacity-60 transition-opacity"
                />
            )}

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-16 rounded-full bg-primary/90 group-hover:bg-primary group-hover:scale-105 transition-all flex items-center justify-center shadow-2xl shadow-black/40">
                    <Play className="size-6 text-white fill-white ml-1" />
                </div>
            </div>

            {/* Gradient scrim */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
        </div>
    )
}