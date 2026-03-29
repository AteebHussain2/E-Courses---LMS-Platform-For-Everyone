"use client"

import { Video, Radio, Pencil, Trash2, GripVertical } from "lucide-react";
import { LessonType } from "@/generated/prisma/enums";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Lesson = {
    id: string
    title: string
    type: LessonType
    index: number
}

type Props = {
    lesson: Lesson
    index: number
    moduleId: string
    courseId: string
    communitySlug: string
}

export default function LessonItem({ lesson, index, moduleId, courseId, communitySlug }: Props) {
    return (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background-secondary px-3 py-2.5 group">

            {/* Drag handle */}
            <GripVertical className="size-3.5 text-secondary/30 group-hover:text-secondary/60 cursor-grab shrink-0 transition-colors" />

            {/* Type icon */}
            <div className={cn(
                "size-6 rounded-md flex items-center justify-center shrink-0",
                lesson.type === 'VIDEO' ? "bg-primary/10" : "bg-instructor-bg"
            )}>
                {lesson.type === 'VIDEO'
                    ? <Video className="size-3 text-primary" />
                    : <Radio className="size-3 text-instructor-fg" />
                }
            </div>

            {/* Index + Title */}
            <span className="text-xs font-mono text-secondary/50 shrink-0">
                {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-sm text-foreground truncate flex-1">
                {lesson.title}
            </span>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button type="button" size="icon" variant="ghost" className="size-6 cursor-pointer">
                    <Pencil className="size-3 text-secondary" />
                </Button>
                <Button type="button" size="icon" variant="ghost" className="size-6 cursor-pointer hover:text-destructive">
                    <Trash2 className="size-3 text-secondary" />
                </Button>
            </div>

            <span className={cn(
                "text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0",
                lesson.type === 'VIDEO'
                    ? "bg-primary/10 text-primary"
                    : "bg-instructor-bg text-instructor-fg"
            )}>
                {lesson.type === 'VIDEO' ? 'Video' : 'Live'}
            </span>

        </div>
    )
}