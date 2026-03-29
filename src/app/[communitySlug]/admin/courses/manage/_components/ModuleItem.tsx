"use client"

import { GripVertical, Pencil, Trash2, ChevronDown } from "lucide-react";
import CreateLessonDialog from "./CreateLessonDialog";
import { Button } from "@/components/ui/button";
import { ModuleWithLessons } from "@/lib/types";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import LessonItem from "./LessonItem";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
    module: ModuleWithLessons
    index: number
    courseId: string
    communitySlug: string
    isDragOverlay?: boolean
}

export default function ModuleItem({ module, index, courseId, communitySlug }: Props) {
    const [open, setOpen] = useState(index == 0)
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: module.id })

    const style = { transform: CSS.Transform.toString(transform), transition }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "rounded-xl border border-border bg-input transition-all duration-200",
                isDragging && "opacity-30 border-dashed",
            )}
        >
            {/* Header Row — NOT inside AccordionTrigger */}
            <div className="flex items-center gap-3 px-4 py-3.5">

                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-secondary/30 hover:text-secondary transition-colors touch-none shrink-0"
                >
                    <GripVertical className="size-4" />
                </div>

                {/* Index */}
                <span className="text-xs font-mono text-secondary/60 bg-background-secondary border border-border/80 rounded-md px-1.5 py-0.5 shrink-0 tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                </span>

                {/* Title */}
                <span className="text-sm font-medium text-foreground flex-1 truncate">
                    {module.title}
                </span>

                {/* Lesson count */}
                <span className="text-xs text-secondary shrink-0 hidden sm:block">
                    {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                </span>

                {/* Action buttons — safely outside button */}
                <div className="flex items-center gap-0.5 shrink-0">
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7 cursor-pointer text-secondary hover:text-foreground"
                    >
                        <Pencil className="size-3.5" />
                    </Button>
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-7 cursor-pointer text-secondary hover:text-destructive"
                    >
                        <Trash2 className="size-3.5" />
                    </Button>
                </div>

                {/* Expand toggle — manual, not AccordionTrigger */}
                <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-7 cursor-pointer text-secondary hover:text-foreground shrink-0"
                    onClick={() => setOpen(prev => !prev)}
                >
                    <ChevronDown className={cn(
                        "size-4 transition-transform duration-200",
                        open && "rotate-180"
                    )} />
                </Button>
            </div>

            {/* Expandable Lessons */}
            {open && (
                <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                    {module.lessons.length === 0 ? (
                        <p className="text-xs text-secondary/50 text-center py-3">
                            No lessons yet
                        </p>
                    ) : (
                        module.lessons.map((lesson, i) => (
                            <LessonItem
                                key={lesson.id}
                                lesson={lesson}
                                index={i}
                                moduleId={module.id}
                                courseId={courseId}
                                communitySlug={communitySlug}
                            />
                        ))
                    )}

                    <CreateLessonDialog
                        moduleId={module.id}
                        courseId={courseId}
                        communitySlug={communitySlug}
                    />
                </div>
            )}
        </div>
    )
}