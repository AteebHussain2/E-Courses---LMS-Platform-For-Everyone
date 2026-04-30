"use client"

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import Image from "next/image";

type Props = {
    videoUrl: string
    title: string
    thumbnailUrl?: string | null
    lessonId: string
    videoId: string
    onProgress: (lessonId: string, videoId: string, percent: number) => void
}

function getVideoType(url: string): 'youtube' | 'vimeo' | 'direct' {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
    if (url.includes('vimeo.com')) return 'vimeo'
    return 'direct'
}

function getYouTubeId(url: string): string | null {
    try {
        const u = new URL(url)
        if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
        return u.searchParams.get('v')
    } catch { return null }
}

function getVimeoId(url: string): string | null {
    try {
        const u = new URL(url)
        return u.pathname.split('/').filter(Boolean).pop() ?? null
    } catch { return null }
}

// ─── YouTube Player ───────────────────────────────────────────────────────────

function YouTubePlayer({ videoId, title, onProgress, lessonId, vidId }: {
    videoId: string
    title: string
    lessonId: string
    vidId: string
    onProgress: (lessonId: string, videoId: string, percent: number) => void
}) {
    const playerRef = useRef<unknown>(null)
    const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)  // FIX
    const iframeId = `yt-player-${lessonId}`

    useEffect(() => {
        const initPlayer = () => {
            playerRef.current = new (window as any).YT.Player(iframeId, {
                events: {
                    onStateChange: (e: any) => {
                        if (e.data === 1) {
                            // playing
                            intervalRef.current = setInterval(() => {
                                const player = playerRef.current as any
                                if (!player?.getCurrentTime) return
                                const current = player.getCurrentTime()
                                const total = player.getDuration()
                                if (total > 0) {
                                    const pct = Math.round((current / total) * 100)
                                    onProgress(lessonId, vidId, pct)
                                }
                            }, 5000)
                        } else {
                            clearInterval(intervalRef.current)
                        }
                    }
                }
            })
        }

        if ((window as any).YT?.Player) {
            initPlayer()
        } else {
            const tag = document.createElement('script')
            tag.src = 'https://www.youtube.com/iframe_api'
            document.head.appendChild(tag)
                ; (window as any).onYouTubeIframeAPIReady = initPlayer
        }

        return () => clearInterval(intervalRef.current)
    }, [videoId, iframeId, lessonId, vidId, onProgress])

    return (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
            <iframe
                id={iframeId}
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full"
            />
        </div>
    )
}

// ─── Direct MP4 Player ────────────────────────────────────────────────────────

function DirectPlayer({ url, title, lessonId, vidId, onProgress }: {
    url: string
    title: string
    lessonId: string
    vidId: string
    onProgress: (lessonId: string, videoId: string, percent: number) => void
}) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const lastReportedRef = useRef<number>(-1)  // avoid firing duplicate percentages

    const handleTimeUpdate = () => {
        const v = videoRef.current
        if (!v || !v.duration) return
        const pct = Math.round((v.currentTime / v.duration) * 100)
        // only fire on every 5% step
        if (pct % 5 === 0 && pct !== lastReportedRef.current) {
            lastReportedRef.current = pct
            onProgress(lessonId, vidId, pct)
        }
    }

    return (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
            <video
                ref={videoRef}
                src={url}
                controls
                autoPlay
                title={title}
                className="size-full"
                onTimeUpdate={handleTimeUpdate}
            />
        </div>
    )
}

// ─── Vimeo Player ─────────────────────────────────────────────────────────────

function VimeoPlayer({ vimeoId, title, lessonId, vidId, onProgress }: {
    vimeoId: string
    title: string
    lessonId: string
    vidId: string
    onProgress: (lessonId: string, videoId: string, percent: number) => void
}) {
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const durationRef = useRef<number>(0)
    const currentRef = useRef<number>(0)

    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (!e.data || typeof e.data !== 'string') return
            try {
                const data = JSON.parse(e.data)
                if (data.event === 'ready') {
                    iframeRef.current?.contentWindow?.postMessage(
                        JSON.stringify({ method: 'addEventListener', value: 'timeupdate' }), '*'
                    )
                    iframeRef.current?.contentWindow?.postMessage(
                        JSON.stringify({ method: 'getDuration' }), '*'
                    )
                }
                if (data.method === 'getDuration') durationRef.current = data.value
                if (data.event === 'timeupdate') {
                    currentRef.current = data.data.seconds
                    if (durationRef.current > 0) {
                        const pct = Math.round((currentRef.current / durationRef.current) * 100)
                        onProgress(lessonId, vidId, pct)
                    }
                }
            } catch { /* ignore malformed messages */ }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [lessonId, vidId, onProgress])

    return (
        <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
            <iframe
                ref={iframeRef}
                src={`https://player.vimeo.com/video/${vimeoId}?api=1&player_id=vimeo-${lessonId}`}
                title={title}
                allow="autoplay; fullscreen"
                allowFullScreen
                className="size-full"
            />
        </div>
    )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function VideoProgressTracker({
    videoUrl, title, thumbnailUrl, lessonId, videoId, onProgress
}: Props) {
    const [playing, setPlaying] = useState(false)
    const type = getVideoType(videoUrl)
    const ytId = type === 'youtube' ? getYouTubeId(videoUrl) : null
    const vimeoId = type === 'vimeo' ? getVimeoId(videoUrl) : null

    if (!playing) {
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
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-16 rounded-full bg-primary/90 group-hover:bg-primary group-hover:scale-105 transition-all flex items-center justify-center shadow-2xl shadow-black/40">
                        <Play className="size-6 text-white fill-white ml-1" />
                    </div>
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
            </div>
        )
    }

    if (type === 'youtube' && ytId) {
        return <YouTubePlayer videoId={ytId} title={title} lessonId={lessonId} vidId={videoId} onProgress={onProgress} />
    }
    if (type === 'vimeo' && vimeoId) {
        return <VimeoPlayer vimeoId={vimeoId} title={title} lessonId={lessonId} vidId={videoId} onProgress={onProgress} />
    }
    return <DirectPlayer url={videoUrl} title={title} lessonId={lessonId} vidId={videoId} onProgress={onProgress} />
}