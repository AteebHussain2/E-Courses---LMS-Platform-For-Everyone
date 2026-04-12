"use client"

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PostWithDetails, voteOnPollAction, reactToPostAction, deletePostAction } from "@/actions/posts";
import { Megaphone, FileText, BarChart2, Pin, Edit2, Trash2, Check } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

const TYPE_META = {
    POST: { label: 'Post', icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
    ANNOUNCEMENT: { label: 'Announcement', icon: Megaphone, color: 'text-moderator-fg', bg: 'bg-moderator-bg' },
    POLL: { label: 'Poll', icon: BarChart2, color: 'text-instructor-fg', bg: 'bg-instructor-bg' },
}

const EMOJIS = ['❤️', '👍', '🔥', '😂', '😮']

type Props = {
    post: PostWithDetails
    communitySlug: string
}

export default function PostCard({ post, communitySlug }: Props) {
    const { user } = useUser()
    const queryClient = useQueryClient()
    const meta = TYPE_META[post.type]
    const Icon = meta.icon

    const totalVotes = post.pollOptions.reduce((sum, o) => sum + o.votes.length, 0)
    const userVotedOptionId = post.pollOptions.find(o => o.votes.some(v => v.userId === user?.id))?.id

    const voteMutation = useMutation({
        mutationFn: ({ optionId }: { optionId: string }) =>
            voteOnPollAction(post.id, optionId, user!.id, communitySlug),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts', communitySlug] }),
        onError: (e) => toast.error(e.message)
    })

    const reactMutation = useMutation({
        mutationFn: ({ emoji }: { emoji: string }) =>
            reactToPostAction(post.id, emoji, user!.id, communitySlug),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts', communitySlug] }),
        onError: (e) => toast.error(e.message)
    })

    const deleteMutation = useMutation({
        mutationFn: () => deletePostAction(post.id, communitySlug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts', communitySlug] })
            toast.success("Post deleted")
        },
        onError: (e) => toast.error(e.message)
    })

    // Group reactions by emoji
    const reactionMap = post.reactions.reduce<Record<string, { count: number; userReacted: boolean }>>((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = { count: 0, userReacted: false }
        acc[r.emoji].count++
        if (r.userId === user?.id) acc[r.emoji].userReacted = true
        return acc
    }, {})

    return (
        <div className={cn(
            "rounded-xl border bg-card overflow-hidden transition-all",
            post.isPinned && "border-primary/30 ring-1 ring-primary/10",
            post.type === 'ANNOUNCEMENT' && "border-moderator-bg"
        )}>
            {/* Header */}
            <div className="flex items-start gap-3 px-5 pt-4 pb-3">
                {/* Type badge */}
                <div className={cn("mt-0.5 size-8 rounded-lg flex items-center justify-center shrink-0", meta.bg)}>
                    <Icon className={cn("size-4", meta.color)} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                {post.isPinned && (
                                    <span className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                        <Pin className="size-2.5" /> Pinned
                                    </span>
                                )}
                                <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full uppercase tracking-wide", meta.bg, meta.color)}>
                                    {meta.label}
                                </span>
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mt-1 leading-snug">{post.title}</h3>
                        </div>

                        {/* Admin actions */}
                        <div className="flex items-center gap-1 shrink-0">
                            <Button asChild variant="ghost" size="icon-sm" className="cursor-pointer text-muted hover:text-foreground">
                                <Link href={`/${communitySlug}/admin/posts/edit?postId=${post.id}`}>
                                    <Edit2 className="size-3.5" />
                                </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon-sm" className="cursor-pointer text-muted hover:text-destructive">
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete post?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will soft-delete the post. Recoverable within 48 hours.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            variant="destructive"
                                            className="cursor-pointer"
                                            onClick={() => deleteMutation.mutate()}
                                            disabled={deleteMutation.isPending}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>

                    {/* Author + time */}
                    {post.author && (
                        <p className="text-xs text-muted mt-1">
                            {post.author.firstName} {post.author.lastName}
                            {' · '}
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                    )}
                </div>
            </div>

            {/* Image */}
            {post.imageUrl && (
                <div className="relative w-full aspect-video bg-muted">
                    <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
                </div>
            )}

            {/* Content */}
            {post.content && (
                <p className="px-5 py-3 text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </p>
            )}

            {/* Poll */}
            {post.type === 'POLL' && post.pollOptions.length > 0 && (
                <div className="px-5 py-3 space-y-2">
                    {post.pollOptions.map(option => {
                        const votes = option.votes.length
                        const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0
                        const isVoted = userVotedOptionId === option.id

                        return (
                            <button
                                key={option.id}
                                type="button"
                                disabled={!user || voteMutation.isPending}
                                onClick={() => user && voteMutation.mutate({ optionId: option.id })}
                                className={cn(
                                    "w-full relative rounded-lg border overflow-hidden text-left transition-all cursor-pointer",
                                    isVoted
                                        ? "border-primary/40 bg-primary/5"
                                        : "border-border bg-input hover:border-primary/30"
                                )}
                            >
                                {/* Progress bar */}
                                <div
                                    className={cn(
                                        "absolute inset-0 transition-all duration-500",
                                        isVoted ? "bg-primary/15" : "bg-muted/40"
                                    )}
                                    style={{ width: `${userVotedOptionId ? pct : 0}%` }}
                                />

                                <div className="relative flex items-center justify-between px-3 py-2.5 gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {isVoted && <Check className="size-3.5 text-primary shrink-0" />}
                                        <span className="text-sm text-foreground truncate">{option.text}</span>
                                    </div>
                                    {userVotedOptionId && (
                                        <span className="text-xs font-medium text-muted shrink-0">{pct}%</span>
                                    )}
                                </div>
                            </button>
                        )
                    })}
                    <p className="text-xs text-muted pt-1">
                        {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
                        {userVotedOptionId && ' · Tap to change'}
                    </p>
                </div>
            )}

            {/* Reactions */}
            <div className="flex items-center gap-2 px-5 py-3 border-t border-border/50 flex-wrap">
                {/* Show existing reaction counts */}
                {Object.entries(reactionMap).map(([emoji, { count, userReacted }]) => (
                    <button
                        key={emoji}
                        type="button"
                        disabled={!user || reactMutation.isPending}
                        onClick={() => user && reactMutation.mutate({ emoji })}
                        className={cn(
                            "flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-all cursor-pointer",
                            userReacted
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-input border-border text-muted hover:border-primary/30"
                        )}
                    >
                        <span>{emoji}</span>
                        <span>{count}</span>
                    </button>
                ))}

                {/* Add reaction */}
                <div className="flex items-center gap-1 ml-auto">
                    {EMOJIS.filter(e => !reactionMap[e]).map(emoji => (
                        <button
                            key={emoji}
                            type="button"
                            disabled={!user || reactMutation.isPending}
                            onClick={() => user && reactMutation.mutate({ emoji })}
                            className="size-7 rounded-full text-sm hover:bg-muted flex items-center justify-center transition-colors cursor-pointer opacity-40 hover:opacity-100"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}