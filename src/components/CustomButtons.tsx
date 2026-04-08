"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { AlertTriangle, AlertTriangleIcon, Edit2, Plus, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLessonAction } from '@/actions/lessons';
import { deleteModuleAction } from '@/actions/modules';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

type ButtonProps = {
    className?: string,
    side?: 'left' | 'top' | 'bottom' | 'right',
    disabled?: boolean,
    tooltip?: boolean
}

type DeleteLessonButtonProps = ButtonProps & {
    lessonId: string
    lessonSlug: string
    courseId: string
}

type DeleteModuleButtonProps = ButtonProps & {
    moduleId: string
    moduleSlug: string
    lessonCount: number
    courseId: string
}

export function DeleteLessonButton({
    lessonId,
    lessonSlug,
    courseId,
    className,
    disabled = false,
    tooltip
}: DeleteLessonButtonProps) {
    const [confirmation, setConfirmation] = useState('')
    const isConfirmed = confirmation === lessonSlug

    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: () => deleteLessonAction(lessonId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['modules', courseId] })
            toast.success("Lesson deleted!", { id: `delete-lesson-${lessonId}` })
        },
        onError: (error) => toast.error(error.message, { id: `delete-lesson-${lessonId}` })
    })

    return (
        <AlertDialog onOpenChange={(o) => { if (!o) setConfirmation('') }}>
            {tooltip ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={disabled || mutation.isPending}
                                className={cn("size-6 cursor-pointer text-secondary hover:text-destructive", className)}
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete Lesson</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <AlertDialogTrigger asChild>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={disabled || mutation.isPending}
                        className={cn("size-6 cursor-pointer text-secondary hover:text-destructive", className)}
                    >
                        <Trash2 className="size-3" />
                    </Button>
                </AlertDialogTrigger>
            )}

            <AlertDialogContent>
                <AlertDialogHeader className="space-y-4">
                    <AlertDialogTitle className="flex items-center gap-3 text-destructive">
                        <Trash2 className="size-4" />
                        Delete Lesson
                    </AlertDialogTitle>
                    <AlertDialogDescription>

                        This will soft-delete this lesson and all its content.
                        Everything can be recovered within <span className="text-foreground font-medium">48 hours</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                    <p className="text-sm text-secondary">
                        Type <span className="text-foreground font-medium">{lessonSlug}</span> to confirm:
                    </p>
                    <Input
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        placeholder={lessonSlug}
                        className="bg-input border-border"
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        className="cursor-pointer"
                        disabled={!isConfirmed || mutation.isPending || disabled}
                        onClick={() => {
                            toast.loading("Deleting lesson...", { id: `delete-lesson-${lessonId}` })
                            mutation.mutate()
                        }}
                    >
                        {mutation.isPending ? "Deleting..." : "Delete Lesson"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    )
}

export function DeleteModuleButton({
    moduleId,
    moduleSlug,
    lessonCount,
    courseId,
    className,
    tooltip,
    disabled = false
}: DeleteModuleButtonProps) {
    const [confirmation, setConfirmation] = useState('')
    const isConfirmed = confirmation === moduleSlug

    const queryClient = useQueryClient()

    const mutation = useMutation({
        mutationFn: () => deleteModuleAction(moduleId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['modules', courseId] })
            toast.success("Module deleted!", { id: `delete-module-${moduleId}` })
        },
        onError: (error) => toast.error(error.message, { id: `delete-module-${moduleId}` })
    })

    return (
        <AlertDialog onOpenChange={(o) => { if (!o) setConfirmation('') }}>
            {tooltip ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                disabled={disabled || mutation.isPending}
                                className={cn("size-7 cursor-pointer text-foreground hover:text-destructive", className)}
                            >
                                <Trash2 className="size-3.5" />
                            </Button>
                        </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Delete Module</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <AlertDialogTrigger asChild>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        disabled={disabled || mutation.isPending}
                        className={cn("size-7 cursor-pointer text-foreground hover:text-destructive", className)}
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </AlertDialogTrigger>
            )}

            <AlertDialogContent>
                <AlertDialogHeader className="space-y-4">
                    <AlertDialogTitle className="flex items-center gap-3 text-destructive">
                        <AlertTriangleIcon className="size-4" />
                        Delete Module
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-3">
                            <p>
                                This will soft-delete this module and all its content.
                                Everything can be recovered within <span className="text-foreground font-medium">48 hours</span>.
                            </p>

                            {/* Lesson count warning */}
                            {lessonCount > 0 && (
                                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
                                    <p className="flex items-center gap-2 text-sm text-destructive font-medium">
                                        <AlertTriangle size={14} className='pb-0.5' /> This module contains {lessonCount} lesson(s).
                                    </p>
                                    <p className="text-xs text-foreground mt-0.5">
                                        All lessons, videos, sessions and recordings inside will also be deleted.
                                    </p>
                                </div>
                            )}
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                    <p className="text-sm text-foreground">
                        Type <span className="text-foreground font-medium">{moduleSlug}</span> to confirm:
                    </p>
                    <Input
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        placeholder={moduleSlug}
                        className="bg-input border-border"
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        className="cursor-pointer"
                        disabled={!isConfirmed || mutation.isPending || disabled}
                        onClick={() => {
                            toast.loading(`Deleting module${lessonCount > 0 ? ` and ${lessonCount} lesson${lessonCount !== 1 ? 's' : ''}` : ''}...`, { id: `delete-module-${moduleId}` })
                            mutation.mutate()
                        }}
                    >
                        Delete Module
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}