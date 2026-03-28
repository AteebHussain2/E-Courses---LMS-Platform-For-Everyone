"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { AlertTriangleIcon, Edit2, Plus, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteCourseAction } from '@/actions/courses';
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
    toast?: boolean
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
        onError: (error) => toast.error(error.message)
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

export const EditCourseButton = ({ courseId, className, side, disabled = false, text }: EditButtonProps) => {
    return (
        <Tooltip>
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
            <Link href={!disabled ? `courses/${courseId}` : ''} className='w-full h-full items-center justify-center flex'>
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