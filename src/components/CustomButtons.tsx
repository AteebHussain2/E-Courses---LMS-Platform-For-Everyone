"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { AlertTriangle, AlertTriangleIcon, Edit2, Plus, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteLessonAction } from '@/actions/lessons';
import { deleteCourseAction } from '@/actions/courses';
import { deleteModuleAction } from '@/actions/modules';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

type ButtonProps = {
    className?: string,
    side?: 'left' | 'top' | 'bottom' | 'right',
    disabled?: boolean,
    tooltip?: boolean
}

type DeleteButtonProps = ButtonProps & {
    communitySlug: string
    courseSlug: string
    courseId: string
}

type EditButtonProps = ButtonProps & {
    text?: string
    courseId: string
}

type ManageButtonProps = ButtonProps & {
    courseId: string
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

export const DeleteCourseButton = ({ communitySlug, courseSlug, courseId, className, side, disabled = false }: DeleteButtonProps) => {
    const [confirmation, setConfirmation] = useState('')
    const isConfirmed = confirmation === courseSlug

    const queryClient = useQueryClient()
    const mutation = useMutation({
        mutationFn: (courseId: string) => deleteCourseAction(courseId),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['courses', communitySlug] })
            toast.success("Deleted course successfully!", { id: `course-delete-${courseId}` })
        },
        onError: (error) => toast.error(error.message, { id: `course-delete-${courseId}` })
    })

    return (
        <AlertDialog>
            <Tooltip>
                <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                        <Button
                            size='icon'
                            variant='destructive'
                            className={cn("cursor-pointer rounded-full p-0! transition-colors", className)}
                            disabled={disabled || mutation.isPending}
                        >
                            <Trash2 className="size-4" />
                        </Button>
                    </AlertDialogTrigger>
                </TooltipTrigger>

                <TooltipContent side={side}>
                    <p>Delete Course</p>
                </TooltipContent>
            </Tooltip>
            <AlertDialogContent>
                <AlertDialogHeader className='space-y-4'>
                    <AlertDialogTitle className='flex items-center gap-3 text-destructive'>
                        <AlertTriangleIcon />
                        Dangerous Actions
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Are you sure you want to delete this course?<br />
                        <span className='text-foreground'>Deleted courses can be recovered within 48 hours of deletion</span>.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-2">
                    <p className="text-sm text-muted">
                        Type <span className="text-foreground font-medium">{courseSlug}</span> to confirm deletion:
                    </p>
                    <Input
                        value={confirmation}
                        onChange={(e) => setConfirmation(e.target.value)}
                        placeholder={courseSlug}
                        className="bg-input border-border"
                    // onPaste={(e) => e.preventDefault()}
                    />
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel
                        className='cursor-pointer'
                        onClick={() => setConfirmation('')}
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        variant='destructive'
                        className={cn("cursor-pointer")}
                        disabled={disabled || mutation.isPending || !isConfirmed}
                        onClick={() => {
                            toast.loading("Deleting course...", { id: `course-delete-${courseId}` })
                            mutation.mutate(courseId)
                        }}
                    >
                        {mutation.isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    )
}

export const EditCourseButton = ({ courseId, className, side, disabled = false, text, tooltip }: EditButtonProps) => {
    return (
        <Tooltip disableHoverableContent={tooltip}>
            <TooltipTrigger asChild>
                <Button
                    size='icon'
                    className={cn("cursor-pointer rounded-full bg-glass-bg text-secondary hover:bg-[#ffffff]/10 transition-colors", className)}
                    asChild
                    disabled={disabled}
                >
                    <Link href={!disabled ? `courses/edit?courseId=${courseId}` : ''}>
                        <Edit2 className="size-4" />{text}
                    </Link>
                </Button>
            </TooltipTrigger>
            <TooltipContent side={side}>
                <p>Edit Course</p>
            </TooltipContent>
        </Tooltip>
    )
}

export const ManageCourseButton = ({ courseId, className, disabled = false }: ManageButtonProps) => {
    return (
        <Button
            size='lg'
            className={cn("w-full cursor-pointer rounded-full bg-[#0C1321] text-foreground hover:border-border hover:bg-[#0F1A2E] hover:text-foreground", className)}
            disabled={disabled}
        >
            <Link href={!disabled ? `courses/manage?courseId=${courseId}` : ''} className='w-full h-full items-center justify-center flex'>
                Manage Course
            </Link>
        </Button>
    )
}

export const AddCourseButton = ({ className, disabled = false }: ButtonProps) => {
    return (
        <Button
            size='lg'
            className={cn("w-full cursor-pointer rounded-full text-foreground hover:text-foreground", className)}
            disabled={disabled}
        >
            <Link href="courses/add" className='w-full h-full items-center justify-center flex gap-2'>
                <Plus /> Add Course
            </Link>
        </Button>
    )
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
                        {mutation.isPending ? "Deleting..." : `Delete Module`}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}