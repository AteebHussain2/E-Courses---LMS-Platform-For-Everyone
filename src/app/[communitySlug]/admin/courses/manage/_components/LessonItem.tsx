"use client"

import { Video, Radio, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { LessonInModule } from "@/lib/types";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

type Props = {
    lesson: LessonInModule
    moduleId: string
    courseId: string
    communitySlug: string
    index: number
}

export default function LessonItem({ index, lesson, moduleId, courseId, communitySlug }: Props) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: lesson.id })

    const style = { transform: CSS.Transform.toString(transform), transition }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "flex items-center gap-3 rounded-lg border border-border bg-background-secondary px-3 py-2.5 group transition-all",
                isDragging && "opacity-30 border-dashed"
            )}
        >
            <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing text-secondary/80 hover:text-secondary transition-colors touch-none shrink-0"
            >
                <GripVertical className="size-3.5" />
            </div>

            <div className={cn(
                "size-6 rounded-md flex items-center justify-center shrink-0",
                lesson.type === 'VIDEO' ? "bg-primary/10" : "bg-instructor-bg"
            )}>
                {lesson.type === 'VIDEO'
                    ? <Video className="size-3 text-primary" />
                    : <Radio className="size-3 text-instructor-fg" />
                }
            </div>

            <span className="text-xs font-mono text-secondary/50 shrink-0 tabular-nums">
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