"use client"

import { getCourseProgressAction, toggleLessonCompleteAction, updateWatchProgressAction, ProgressMap } from "@/actions/progress";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

export function useProgress(courseId: string) {
    const { user } = useUser()
    const queryClient = useQueryClient()
    const queryKey = ['progress', courseId, user?.id]

    useEffect(() => {
        const flush = () => {
            Object.values(pendingRef.current).forEach(clearTimeout)
            // fire all pending updates immediately on tab close
        }
        window.addEventListener('beforeunload', flush)
        return () => window.removeEventListener('beforeunload', flush)
    }, [])

    const { data: progressMap = {}, isLoading } = useQuery<ProgressMap>({
        queryKey,
        queryFn: () => getCourseProgressAction(user!.id, courseId),
        enabled: !!user,
        staleTime: 1000 * 30,
    })

    // Toggle lesson completion with optimistic update
    const completeMutation = useMutation({
        mutationFn: (lessonId: string) =>
            toggleLessonCompleteAction(user!.id, lessonId),
        onMutate: async (lessonId) => {
            await queryClient.cancelQueries({ queryKey })
            const prev = queryClient.getQueryData<ProgressMap>(queryKey)
            queryClient.setQueryData<ProgressMap>(queryKey, old => ({
                ...old,
                [lessonId]: {
                    percent: old?.[lessonId]?.percent ?? 0,
                    isComplete: !old?.[lessonId]?.isComplete,
                    completedAt: !old?.[lessonId]?.isComplete ? new Date().toISOString() : null,
                }
            }))
            return { prev }
        },
        onSuccess: ({ isComplete }, lessonId) => {
            toast.success(isComplete ? "Lesson marked complete ✓" : "Marked incomplete")
        },
        onError: (_err, _lessonId, ctx) => {
            queryClient.setQueryData(queryKey, ctx?.prev)
            toast.error("Failed to update progress")
        },
    })

    // Debounced watch progress updater — fires at most once every 5s per lesson
    const pendingRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

    const updateProgress = useCallback((lessonId: string, videoId: string, percent: number) => {
        if (!user) return

        // Optimistically update local cache
        queryClient.setQueryData<ProgressMap>(queryKey, old => ({
            ...old,
            [lessonId]: {
                percent,
                isComplete: old?.[lessonId]?.isComplete ?? false,
                completedAt: old?.[lessonId]?.completedAt ?? null,
            }
        }))

        // Debounce actual API call
        clearTimeout(pendingRef.current[lessonId])
        pendingRef.current[lessonId] = setTimeout(() => {
            updateWatchProgressAction(user.id, lessonId, videoId, percent)
        }, 5000)
    }, [user, queryClient, queryKey])

    const toggleComplete = useCallback((lessonId: string) => {
        if (!user) return toast.error("Sign in to track progress")
        completeMutation.mutate(lessonId)
    }, [user, completeMutation])

    const getLessonProgress = useCallback((lessonId: string) => {
        return progressMap[lessonId] ?? { percent: 0, isComplete: false, completedAt: null }
    }, [progressMap])

    // Per-module completion fraction
    const getModuleProgress = useCallback((lessonIds: string[]) => {
        if (lessonIds.length === 0) return { completed: 0, total: 0, percent: 0 }
        const completed = lessonIds.filter(id => progressMap[id]?.isComplete).length
        return { completed, total: lessonIds.length, percent: Math.round((completed / lessonIds.length) * 100) }
    }, [progressMap])

    // Overall course progress
    const allLessonIds = Object.keys(progressMap)
    const completedCount = allLessonIds.filter(id => progressMap[id]?.isComplete).length

    return {
        progressMap,
        isLoading,
        updateProgress,
        toggleComplete,
        getLessonProgress,
        getModuleProgress,
        completedCount,
    }
}